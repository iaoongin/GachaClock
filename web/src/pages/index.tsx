import { Card, CardFooter, Image, Button, CardBody } from "@heroui/react";
import DefaultLayout from "@/layouts/default";

export default function IndexPage() {
  const list = [
    {
      title: "Orange",
      img: "https://heroui.com/images/hero-card.jpeg",
      price: "$5.50",
    },
    {
      title: "Tangerine",
      img: "https://heroui.com/images/hero-card.jpeg",
      price: "$3.00",
    },
    {
      title: "Raspberry",
      img: "https://heroui.com/images/hero-card.jpeg",
      price: "$10.00",
    },
    {
      title: "Lemon",
      img: "https://heroui.com/images/hero-card.jpeg",
      price: "$5.30",
    },
    {
      title: "Avocado",
      img: "https://heroui.com/images/hero-card.jpeg",
      price: "$15.70",
    },
    {
      title: "Lemon 2",
      img: "https://heroui.com/images/hero-card.jpeg",
      price: "$8.00",
    },
    {
      title: "Banana",
      img: "https://heroui.com/images/hero-card.jpeg",
      price: "$7.50",
    },
    {
      title: "Watermelon",
      img: "https://heroui.com/images/hero-card.jpeg",
      price: "$12.20",
    },
  ];

  return (
    <DefaultLayout>
      <div className="gap-2 grid grid-cols-2 sm:grid-cols-5">
        {list.map((item, index) => (
          /* eslint-disable no-console */
          <Card
            key={index}
            isPressable
            isFooterBlurred
            shadow="sm"
            onPress={() => console.log("item pressed")}
          >
            <CardBody className="overflow-visible p-0">
              <Image
                alt={item.title}
                className="w-full object-cover "
                radius="lg"
                shadow="sm"
                src={item.img}
                width="100%"
              />
            </CardBody>
            <CardFooter className="shadow-large justify-center before:bg-white/10 border-white/20 border-1 overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] ml-1 z-10">
              <p className="text-tiny text-white/80">{item.title}</p>
              {/* <p className="text-default-500">{item.price}</p> */}
            </CardFooter>
          </Card>
        ))}
      </div>
    </DefaultLayout>
  );
}
