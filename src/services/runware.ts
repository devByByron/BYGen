import { toast } from "sonner";

const API_ENDPOINT = "wss://ws-api.runware.ai/v1";

export interface GenerateImageParams {
  positivePrompt: string;
  model?: string;
  numberResults?: number;
  outputFormat?: string;
  CFGScale?: number;
  scheduler?: string;
  strength?: number;
  promptWeighting?: "compel" | "sdEmbeds" | "none";
  seed?: number | null;
  lora?: string[];
  width?: number;
  height?: number;
}

export interface GeneratedImage {
  imageURL: string;
  positivePrompt: string;
  seed: number;
  NSFWContent: boolean;
}

export class RunwareService {
  private ws: WebSocket | null = null;
  private apiKey: string | null = null;
  private connectionSessionUUID: string | null = null;
  private messageCallbacks: Map<string, (data: any) => void> = new Map();
  private isAuthenticated: boolean = false;
  private connectionPromise: Promise<void> | null = null;

  constructor() {
    this.apiKey = localStorage.getItem("bygen-runware-key");
  }

  private ensureKey() {
    this.apiKey = localStorage.getItem("bygen-runware-key");
    if (!this.apiKey) throw new Error("Missing Runware API key. Open Settings to add it.");
  }

  private connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(API_ENDPOINT);

      this.ws.onopen = () => {
        this.authenticate().then(resolve).catch(reject);
      };

      this.ws.onmessage = (event) => {
        const response = JSON.parse(event.data as string);

        if ((response as any).error || (response as any).errors) {
          const errorMessage = (response as any).errorMessage || (response as any).errors?.[0]?.message || "An error occurred";
          toast.error(errorMessage);
          return;
        }

        if ((response as any).data) {
          (response as any).data.forEach((item: any) => {
            if (item.taskType === "authentication") {
              this.connectionSessionUUID = item.connectionSessionUUID;
              this.isAuthenticated = true;
            } else {
              const callback = this.messageCallbacks.get(item.taskUUID);
              if (callback) {
                callback(item);
                this.messageCallbacks.delete(item.taskUUID);
              }
            }
          });
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        toast.error("Connection error. Please try again.");
        reject(error as any);
      };

      this.ws.onclose = () => {
        this.isAuthenticated = false;
        setTimeout(() => {
          this.connectionPromise = this.connect();
        }, 1000);
      };
    });
  }

  private authenticate(): Promise<void> {
    this.ensureKey();
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error("WebSocket not ready for authentication"));
        return;
      }

      const authMessage = [
        {
          taskType: "authentication",
          apiKey: this.apiKey,
          ...(this.connectionSessionUUID && { connectionSessionUUID: this.connectionSessionUUID }),
        },
      ];

      const authCallback = (event: MessageEvent) => {
        const response = JSON.parse((event.data as string) || "{}");
        if ((response as any).data?.[0]?.taskType === "authentication") {
          this.ws?.removeEventListener("message", authCallback);
          resolve();
        }
      };

      this.ws.addEventListener("message", authCallback);
      this.ws.send(JSON.stringify(authMessage));
    });
  }

  async generateImage(params: GenerateImageParams): Promise<GeneratedImage> {
    this.ensureKey();

    if (!this.connectionPromise) {
      this.connectionPromise = this.connect();
    }
    await this.connectionPromise;

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.isAuthenticated) {
      this.connectionPromise = this.connect();
      await this.connectionPromise;
    }

    const taskUUID = crypto.randomUUID();

    return new Promise((resolve, reject) => {
      const message: any[] = [
        {
          taskType: "imageInference",
          taskUUID,
          model: params.model || "runware:100@1",
          width: params.width ?? 768,
          height: params.height ?? 768,
          numberResults: params.numberResults || 1,
          outputFormat: params.outputFormat || "WEBP",
          steps: 4,
          CFGScale: params.CFGScale || 1,
          scheduler: params.scheduler || "FlowMatchEulerDiscreteScheduler",
          strength: params.strength || 0.8,
          lora: params.lora || [],
          positivePrompt: params.positivePrompt,
        },
      ];

      if (!params.seed) {
        delete message[0].seed;
      }
      if (message[0].model === "runware:100@1") {
        delete message[0].promptWeighting;
      }

      this.messageCallbacks.set(taskUUID, (data) => {
        if ((data as any).error) {
          reject(new Error((data as any).errorMessage));
        } else {
          resolve(data as any);
        }
      });

      this.ws!.send(JSON.stringify(message));
    });
  }
}
