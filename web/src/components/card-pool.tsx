import { AccordionItem, Card, CardBody, CardFooter, Image } from '@heroui/react';
import { useEffect, useRef, useState, useCallback } from 'react';

export interface CardPoolProps {
  historyList: [];
}

export const CardPool: React.FC<CardPoolProps> = ({ historyList }: CardPoolProps) => {
  useEffect(() => {
    console.log('historyList:::', historyList);
  }, []);

  return (
    <div className="columns-1 md:columns-2 lg:columns-2 gap-3 space-y-4">
      {historyList.map((item: any, index: number) => (
        <Card
          className=""
          key={index}
          isFooterBlurred
          isPressable
          shadow="sm"
          onPress={() => console.log('item pressed')}
        >
          <CardBody className="p-0">
            <Image
              alt={item.title}
              className="w-full"
              shadow="sm"
              src={item.img}
              fallbackSrc={item.img_path}
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
