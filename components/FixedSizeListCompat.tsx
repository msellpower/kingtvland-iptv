import React, { CSSProperties, ReactNode } from 'react';
import { List as ReactWindowList } from 'react-window';

interface FixedSizeListProps {
  height: number;
  width: number | string;
  itemCount: number;
  itemSize: number;
  itemData?: any;
  className?: string;
  direction?: 'ltr' | 'rtl';
  style?: CSSProperties;
  children: (props: { index: number; style: CSSProperties; data: any }) => ReactNode;
}

export const FixedSizeList: React.FC<FixedSizeListProps> = ({
  height,
  width,
  itemCount,
  itemSize,
  itemData,
  children,
  ...rest
}) => {
  const Row = ({ index, style }: { index: number; style: CSSProperties }) => {
    return <>{children({ index, style, data: itemData })}</>;
  };

  return (
    <ReactWindowList
      height={height}
      width={width}
      rowCount={itemCount}
      rowHeight={itemSize}
      rowComponent={Row}
      rowProps={{ data: itemData }}
      {...rest}
    />
  );
};
