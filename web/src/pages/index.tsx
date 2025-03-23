/* eslint-disable no-console */
import { Accordion, AccordionItem, Card, CardBody, Image } from "@heroui/react";
import { useEffect, useState } from "react";

import DefaultLayout from "@/layouts/default";

export default function IndexPage() {
  const [cardGroup, setCardGroup] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      const meta = await fetch("data/meta.json").then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          return [];
        }
      });

      console.log("meta:::", meta);

      Object.keys(meta).forEach((key) => {
        console.log("key:::", key);
        fetch(`data/${key}/history.json`)
          .then((res) => {
            if (res.ok) {
              return res.json();
            } else {
              return [];
            }
          })
          .then((data) => {
            console.log("data:::", data);
            const currentVersion = data[0].version;
            const historyList = data
              .filter((item: any) => item.version === currentVersion)
              .map((item: any) => {
                let copy = { ...item };

                copy.title = item.title.substring(
                  0,
                  item.title.indexOf("」") + 1
                );

                return copy;
              });

            // 设置group
            setCardGroup((prev: any) => ({
              ...prev,
              [key]: {
                currentVersion: historyList[0].version,
                currentTimer: historyList[0].timer,
                historyList: historyList,
              },
            }));
          });
      });
    };

    fetchData();
  }, []);

  console.log("cardGroup:::", cardGroup);

  return (
    <DefaultLayout>
      <div>
        <Accordion
          selectedKeys={Object.keys(cardGroup)}
          selectionMode="multiple"
          variant="splitted"
        >
          {renderAccordionItem(cardGroup)}
        </Accordion>
      </div>
    </DefaultLayout>
  );
}

// 时间格式化函数
const formatTime = (seconds: number) => {
  const days = Math.floor(seconds / (24 * 3600)); // 计算天数
  const hours = Math.floor((seconds % (24 * 3600)) / 3600); // 计算小时
  const minutes = Math.floor((seconds % 3600) / 60); // 计算分钟
  const secs = Math.floor(seconds % 60); // 计算秒

  return `${days}天 ${hours}时 ${minutes}分 ${secs}秒`;
};

interface CountdownTimerProps {
  date: string;
  className?: string;
  prefix?: string;
}

// 倒计时组件
const CountdownTimer = ({ date, className, prefix }: CountdownTimerProps) => {
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

function renderAccordionItem(cardGroup: any) {
  if (!cardGroup) {
    return <AccordionItem>Loading...</AccordionItem>;
  }

  return Object.keys(cardGroup).map((key) => (
    <AccordionItem
      key={key}
      aria-label={cardGroup[key].currentVersion}
      title={
        <CountdownTimer
          prefix={`【${key}】`}
          className={"text-lg"}
          date={cardGroup[key].currentTimer.split("~")[1]}
        />
      }
    >
      {renderCard(cardGroup[key].historyList)}
    </AccordionItem>
  ));
}

function renderCard(data: any) {
  return (
    <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 mt-1">
      {data.map((item: any, index: number) => (
        <Card
          key={index}
          isFooterBlurred
          isPressable
          shadow="sm"
          onPress={() => console.log("item pressed")}
        >
          <CardBody className="overflow-visible p-0">
            <Image
              alt={item.title}
              className="object-cover img-fit"
              radius="lg"
              shadow="sm"
              src={item.img_path}
            />
          </CardBody>
          {/* <CardFooter className="shadow-large justify-center before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] ml-1 z-10"> */}
          {/* <p className="text-base text-white/80">{item.title}</p> */}
          {/* <p className="text-default-500">{item.price}</p> */}
          {/* </CardFooter> */}
        </Card>
      ))}
    </div>
  );
}
