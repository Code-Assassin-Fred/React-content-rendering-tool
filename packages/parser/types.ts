export type Block =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: number; text: string }
  | { type: "bullet_list"; items: string[] }
  | { type: "number_list"; items: string[] }
  | { type: "image_description"; text: string }
  | { type: "example"; text: string }
  | { type: "note"; text: string };

export interface ParseOptions {
  detectHeadings?: boolean;
}
