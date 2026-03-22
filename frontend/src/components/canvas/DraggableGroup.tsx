import React, { useRef, useEffect } from 'react';
import { Group, Rect, Transformer } from 'react-konva';

// A4 base dimensions matching Builder.tsx
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

interface DraggableGroupProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isSelected: boolean;
  isZoomed?: boolean;
  onSelect: () => void;
  onChange: (newAttrs: any) => void;
  children: React.ReactNode;
}

export const DraggableGroup: React.FC<DraggableGroupProps> = ({
  id,
  x,
  y,
  width,
  height,
  isSelected,
  isZoomed = false,
  onSelect,
  onChange,
  children,
}) => {
  const groupRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Group
        ref={groupRef}
        x={x}
        y={y}
        width={width}
        height={height}
        draggable={!isZoomed}
        dragBoundFunc={(pos) => {
          // Calculate scale independently of group scale (stage scale affects absolute pos, but we need relative bounds)
          // The pos given is the absolute stage position. We need to clamp it based on the parent's scale.
          const stage = groupRef.current?.getStage();
          if (!stage) return pos;
          
          const scale = stage.scaleX();
          const padding = 0; // Or adjust if needing margin

          // Absolute min/max boundaries corresponding to local 0,0 and W,H
          const minX = stage.x();
          const minY = stage.y();
          const maxX = stage.x() + (A4_WIDTH - width) * scale;
          const maxY = stage.y() + (A4_HEIGHT - height) * scale;
          
          return {
            x: Math.max(minX + padding * scale, Math.min(pos.x, maxX - padding * scale)),
            y: Math.max(minY + padding * scale, Math.min(pos.y, maxY - padding * scale)),
          };
        }}
        onClick={isZoomed ? undefined : onSelect}
        onTap={isZoomed ? undefined : onSelect}
        onDragEnd={(e) => {
          onChange({
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={() => {
          const node = groupRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);

          onChange({
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
          });
        }}
      >
        {/* Invisible bounding box for the Group to ensure the whole area is clickable/draggable */}
        <Rect
          width={width}
          height={height}
          fill="transparent"
          stroke={isSelected ? '#6366f1' : 'transparent'}
          strokeWidth={1}
          dash={[4, 4]}
        />
        {children}
      </Group>

      {isSelected && !isZoomed && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize minimums
            if (newBox.width < 50 || newBox.height < 20) {
              return oldBox;
            }
            // limit resize maximums (prevent extending off A4 page)
            if (newBox.x < 0 || newBox.y < 0 || newBox.x + newBox.width > A4_WIDTH || newBox.y + newBox.height > A4_HEIGHT) {
              return oldBox;
            }
            return newBox;
          }}
          anchorSize={8}
          anchorCornerRadius={4}
          borderStroke="#4f46e5"
          anchorStroke="#4f46e5"
          anchorFill="#fff"
        />
      )}
    </>
  );
};
