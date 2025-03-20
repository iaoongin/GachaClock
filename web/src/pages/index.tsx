/* eslint-disable no-console */
import DefaultLayout from "@/layouts/default";
import {
  Accordion,
  AccordionItem,
  Card,
  CardBody,
  CardFooter,
  Image,
} from "@heroui/react";
import { useEffect, useState } from "react";

export default function IndexPage() {
  const [map, setMap] = useState<any>();

  useEffect(() => {
    fetch("https://gclock.yffjglcms.com/spider/data/meta.json")
      .then((res) => res.json())
      .then((data) => {
        console.log("meta:::", data);
        Object.entries(data).forEach(([k, v]) => {
          fetch("https://gclock.yffjglcms.com/spider/" + v)
            .then((res1) => res1.json())
            .then((data1) => {
              setMap((prev: any) => ({ ...prev, [k]: data1 }));
            });
        });
      });
  }, []);

  console.log("map:::", map);

  return (
    <DefaultLayout>
      <div>
        <Accordion selectionMode="multiple" variant="splitted">
          {map &&
            Object.entries(map).map(([k, v]) => (
              <AccordionItem key={k} aria-label={k} title={k}>
                {v && v.map((item: any) => renderCard(item))}
              </AccordionItem>
            ))}
        </Accordion>
      </div>
    </DefaultLayout>
  );
}

function renderCard(data: any) {
  return (
    <div className="gap-4 grid grid-cols-2 sm:grid-cols-5 mt-1">
      {data.gachas.map((item: any, index: number) => (
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
              className="w-[230px] h-[230px] object-cover img-fit"
              radius="lg"
              shadow="sm"
              src={item.img}
            />
          </CardBody>
          <CardFooter className="shadow-large justify-center before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] ml-1 z-10">
            <p className="text-tiny text-white/80">{item.title}</p>
            {/* <p className="text-default-500">{item.price}</p> */}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
