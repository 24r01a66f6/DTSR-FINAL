export type BlockType = 'text' | 'header' | 'list';

export interface LayoutBlock {
  id: string;
  type: BlockType;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  fontSize?: number;
  fontWeight?: string | number;
  fontFamily?: string;
  align?: 'left' | 'center' | 'right';
  fill?: string;
}
