import { AccordionItem, Card, CardBody, CardFooter, Image } from '@heroui/react';
import { useEffect, useRef, useState, useCallback } from 'react';

export interface CardPoolProps {
  historyList: [];
}

export const CardPool: React.FC<CardPoolProps> = ({ historyList }: CardPoolProps) => {
  console.log('historyList:::', historyList);

  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [dimensions, setDimensions] = useState({});
  const [maxItemWidth, setMaxItemWidth] = useState(0);
  const [layout, setLayout] = useState({ columns: 0, itemWidth: 0 });
  const GAP = 16; // 卡片间距

  // 图片加载完成处理器
  const handleImageLoad = (e, id) => {
    const { naturalWidth, naturalHeight } = e.target;
    setDimensions((prev) => ({
      ...prev,
      [id]: { width: naturalWidth, height: naturalHeight },
    }));
  };

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  // 布局计算逻辑
  useEffect(() => {
    if (!containerRef.current || Object.keys(dimensions).length !== historyList.length) return;

    console.log('dimensions:::', dimensions);
    console.log('dimensions len:::', Object.keys(dimensions).length);

    const containerWidth = containerRef.current.offsetWidth;
    const validDimensions = Object.values(dimensions).filter(Boolean);
    console.log('containerWidth:::', containerWidth);
    console.log('validDimensions:::', validDimensions);

    // 计算平均宽度和最大列数
    const maxWidth = Math.max(...validDimensions.map((img: any) => img?.width));

    let calcItemWidth = maxWidth;
    if (calcItemWidth > containerWidth) {
      calcItemWidth = containerWidth - GAP;
    } else if (calcItemWidth < (containerWidth - GAP) / 4) {
      calcItemWidth = containerWidth / 4 - GAP;
    } else {
      calcItemWidth = containerWidth / 2 - GAP;
    }

    const maxColumns = Math.floor((containerWidth + GAP) / (calcItemWidth + GAP));
    console.log('maxItemWidth:::', calcItemWidth);
    console.log('maxColumns:::', maxColumns);

    const columns = maxColumns;
    const totalGap = (columns - 1) * GAP;
    const itemWidth = (containerWidth - totalGap) / columns;

    console.log('columns:::', columns);
    console.log('itemWidth:::', itemWidth);
    console.log('maxColumns:::', maxColumns);
    setLayout({ columns, itemWidth });
    setMaxItemWidth(calcItemWidth);
  }, [Object.keys(dimensions).length, containerWidth]);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${layout.columns}, 1fr)`,
        gap: GAP,
        width: '100%',
      }}
    >
      {historyList.map((item: any, index: number) => (
        <Card
          className="mx-auto"
          key={index}
          isFooterBlurred
          isPressable
          shadow="sm"
          onPress={() => console.log('item pressed')}
        >
          <CardBody className="overflow-visible p-0">
            <Image
              alt={item.title}
              className="h-full"
              width={maxItemWidth}
              radius="lg"
              shadow="sm"
              src={item.img_path}
              onLoad={(e) => handleImageLoad(e, item.title)}
            />
          </CardBody>
          <CardFooter className="shadow-large justify-center before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] ml-1 z-10">
            <p className="text-base text-white/80">{item.title}</p>
            {/* <p className="text-default-500">{item.price}</p> */}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

interface CountdownTimerProps {
  date: string;
  className?: string;
  prefix?: string;
}

// 倒计时组件
export const CountdownTimer = ({ date, className, prefix }: CountdownTimerProps) => {
  // console.log("date:::", date);

  const initialTime = new Date(date).getTime() - new Date().getTime();
  const [timeLeft, setTimeLeft] = useState(initialTime / 1000);

  useEffect(() => {
    if (timeLeft <= 0) return; // 计时结束，停止倒计时

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer); // 清理定时器
  }, [timeLeft]);

  return (
    <span className={className}>
      {prefix} 剩余时间: {formatTime(timeLeft)}
    </span>
  );
};

// 时间格式化函数
const formatTime = (seconds: number) => {
  if (seconds <= 0) {
    return '已结束';
  }

  const days = Math.floor(seconds / (24 * 3600)); // 计算天数
  const hours = Math.floor((seconds % (24 * 3600)) / 3600); // 计算小时
  const minutes = Math.floor((seconds % 3600) / 60); // 计算分钟
  const secs = Math.floor(seconds % 60); // 计算秒

  return `${days}天 ${hours}时 ${minutes}分 ${secs}秒`;
};
