import { Accordion, AccordionItem, Card, CardBody, CardFooter, Image } from '@heroui/react';
import { useEffect, useState } from 'react';

import DefaultLayout from '@/layouts/default';
import { useLocalStorage } from 'react-use';
import { CardPool, CardPoolProps, CountdownTimer } from '@/components/card-pool';
import { Link } from '@heroui/link';

export default function IndexPage() {
  const [cardGroup, setCardGroup] = useState<CardPoolProps>();
  const [expandedKeys, setExpandedKeys] = useLocalStorage('expandedKeys', null); // 初始值为空

  useEffect(() => {
    const fetchData = async () => {
      const meta = await fetch('data/meta.json').then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          return [];
        }
      });

      console.log('meta:::', meta);

      Object.keys(meta).forEach((key) => {
        console.log('key:::', key);
        fetch(`data/${key}/history.json`)
          .then((res) => res.json())
          .then((data) => {
            console.log('data:::', data);
            const currentVersion = data[0].version;
            const historyList = data
              .filter((item: any) => item.version === currentVersion)
              .map((item: any) => {
                let copy = { ...item };

                copy.title = item.title.substring(0, item.title.indexOf('」') + 1);

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

      // 加载ww
      fetch(meta['ww'])
        .then((res) => res.json())
        .then((data) => {
          console.log('res::', data);
          const historyList = data.map((item: any) => item.gachas[0]);

          console.log('historyList::', historyList);

          // 设置group
          setCardGroup((prev: any) => ({
            ...prev,
            ww: {
              currentVersion: data[0].timer,
              currentTimer: data[0].timer.join('~'),
              historyList: historyList,
            },
          }));
        });
    };

    fetchData();
  }, []);

  console.log('cardGroup:::', cardGroup);

  useEffect(() => {
    if (expandedKeys) {
      return;
    }

    if (!cardGroup || Object.keys(cardGroup).length == 0) {
      return;
    }

    setExpandedKeys(Object.keys(cardGroup));
  }, [cardGroup, expandedKeys, setExpandedKeys]);

  if (!cardGroup || Object.keys(cardGroup).length == 0) {
    return <div>Loading...</div>;
  }

  return (
    <DefaultLayout>
      <div>
        <Accordion
          expandedKeys={expandedKeys}
          defaultExpandedKeys={expandedKeys}
          selectionMode="multiple"
          variant="splitted"
          onExpandedChange={(keys) => {
            setExpandedKeys([...keys]);
          }}
        >
          {Object.keys(cardGroup)
            .sort((a, b) => a.localeCompare(b))
            .map((key) => (
              <AccordionItem
                key={key}
                aria-label={cardGroup[key].currentVersion}
                startContent={`${key.toUpperCase()}`}
                subtitle={
                  <CountdownTimer
                    className={'text-lg'}
                    date={cardGroup[key].currentTimer.split('~')[1]}
                  />
                }
                indicator={({ isOpen }) => <Link href={`/history/${key}`}>H</Link>}
              >
                <CardPool historyList={cardGroup[key].historyList} />
              </AccordionItem>
            ))}
        </Accordion>
      </div>
    </DefaultLayout>
  );
}
