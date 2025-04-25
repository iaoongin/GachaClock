import { Accordion, AccordionItem } from '@heroui/react';
import { useEffect, useState } from 'react';

import { CardPool, CardPoolProps, CountdownTimer } from '@/components/card-pool';
import DefaultLayout from '@/layouts/default';
import { Link } from '@heroui/link';
import { useLocalStorage } from 'react-use';

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

      Object.keys(meta).forEach((game) => {
        console.log('game:::', game);
        fetchEachGame(game, meta[game]);
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

  function fetchEachGame(key: string, lastPoolUrl: string) {
    fetch(`data/${key}/history.json`)
      .then((res) => res.json())
      .then(async (data) => {
        console.log('data:::', data);
        const currentVersion = data[0].version;
        const historyList = data
          .filter((item: any) => item.version === currentVersion)
          .filter((item: any) => item.type === '角色')
          .map((item: any) => {
            let copy = { ...item };

            copy.title = item.title.substring(0, item.title.indexOf('」') + 1);

            return copy;
          });

        const currentEndTimer = historyList[0].timer.split('~')[1];
        if (new Date(currentEndTimer).getTime() < new Date().getTime()) {
          // 当前版本已过期, 从最新卡池信息获取
          console.log(`${key} 当前版本已过期(${currentEndTimer}), 从最新卡池信息获取`);
          return await fallbackFetch(key, lastPoolUrl);
        }

        // 设置group
        setCardGroup((prev: any) => ({
          ...prev,
          [key]: {
            currentVersion: historyList[0].version,
            currentTimer: historyList[0].timer,
            historyList: historyList,
          },
        }));
      })
      .catch(async (err) => {
        console.log('err:::', err);
        // 无法获取历史卡池信息，从最新卡池信息获取
        console.log(`${key} 无法获取历史卡池信息，从最新卡池信息获取`);
        return await fallbackFetch(key, lastPoolUrl);
      });
  }

  async function fallbackFetch(key: string, lastPoolUrl: string) {
    let role = await fetchEachGameRole(key);
    console.log(`${key} role`, role);

    fetch(lastPoolUrl)
      .then((res) => res.json())
      .then((data) => {
        console.log('data::', data);
        const historyList = data
          .filter((item: any) => item.type === '角色')

          .map((item: any) => item.gachas[0]);
        historyList.forEach((item) => {
          item['img'] = role?.[item['title']]?.['promotion_img'][1] ?? item['img'];
          item['img_path'] = role?.[item['title']]?.['simple_img'] ?? item['img_path'];
        });

        console.log(`${key} historyList::`, historyList);

        let cardGroup = {
          [key]: {
            currentVersion: data[0].timer,
            currentTimer: data[0].timer.join('~'),
            historyList: historyList,
          },
        };

        // 设置group
        setCardGroup((prev: any) => ({
          ...prev,
          ...cardGroup,
        }));
        return;
      });
  }

  function fetchEachGameRole(key) {
    return fetch(`data/${key}/role.json`)
      .then((res) => res.json())
      .then(async (data) => {
        console.log('role data:::', data);
        let tmp_role = data.reduce((acc, item) => {
          acc[item.title] = item;
          return acc;
        }, {});
        return tmp_role;
      })
      .catch(async (err) => {
        console.log('err:::', err);
        // 无法获取历史卡池信息，从最新卡池信息获取
        console.log(`${key} 无法获取角色信息，返回空.`);
        return await {};
      });
  }
}
