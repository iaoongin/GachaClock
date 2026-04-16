import { Accordion, AccordionItem } from '@heroui/react';
import { useEffect, useRef, useState } from 'react';

import { CardPool, CardPoolProps, CountdownTimer } from '@/components/card-pool';
import DefaultLayout from '@/layouts/default';
import { Link } from '@heroui/link';
import { useLocalStorage } from 'react-use';

export default function IndexPage() {
  const [cardGroup, setCardGroup] = useState<CardPoolProps>();
  const [expandedKeys, setExpandedKeys] = useLocalStorage('expandedKeys', null);
  const roleCache = useRef<Record<string, any>>({});

  useEffect(() => {
    const fetchData = async () => {
      const meta = await fetch('data/meta.json').then((res) => (res.ok ? res.json() : {}));

      console.log('meta:::', meta);

      await Promise.all(Object.keys(meta).map((game) => fetchEachGame(game, meta[game])));
    };

    fetchData();
  }, []);

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
                startContent={
                  <img
                    alt="Logo"
                    className="w-10 h-10 rounded-full"
                    src={`${key.toLocaleLowerCase()}.png`}
                  />
                }
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

  async function fetchEachGame(key: string, lastPoolUrl: string) {
    const role = await fetchEachGameRole(key);
    console.log(`${key} role`, role);

    let historyList: any[];
    let version: string;
    let timer: string;
    let roleKey: string; // 历史卡池为 s，meta信息为title

    try {
      roleKey = 's';
      const data = await fetch(`data/${key}/history.json`).then((res) => res.json());
      console.log(`${key} history`, data);

      const currentVersion = data[0].version;
      historyList = data
        .filter((item: any) => item.version === currentVersion)
        .filter((item: any) => item.type === '角色')
        .map((item: any) => {
          const copy = { ...item };
          copy.title = item.title.substring(0, item.title.indexOf('」') + 1);
          return copy;
        });

      const currentEndTimer = historyList[0]?.timer?.split('~')[1];
      const currentStartTimer = historyList[0]?.timer?.split('~')[0];
      let currentTime = new Date().getTime();
      if (new Date(currentEndTimer).getTime() < currentTime) {
        throw new Error('版本过期');
      }
      if (currentTime < new Date(currentStartTimer).getTime()) {
        throw new Error('版本未开始');
      }

      version = historyList[0].version;
      timer = historyList[0].timer;
    } catch (err) {
      console.log(`${key} history err, 使用最新卡池数据, 即从meta里面获取。 `, err);

      roleKey = 'title';

      const data = await fetch(lastPoolUrl).then((res) => res.json());
      console.log(`${key} meta`, data);

      if (!role || Object.keys(role).length === 0) {
        historyList = data
          .filter((item: any) => item.type === '角色')
          .map((item: any) => item.gachas[0]);
      } else {
        historyList = data
          .filter((item: any) => item.type === '角色')
          .flatMap((item: any) => item.gachas)
          .filter(
            (item: any) => !role?.[item['title']] || role?.[item['title']].chara_rarity === '5星',
          );
      }

      version = data[data.length - 1].timer;
      timer = data[data.length - 1].timer.join('~');
    }

    historyList.forEach((item) => {
      const promotionImg = role?.[item[roleKey]]?.['promotion_img'];
      const simpleImg = role?.[item[roleKey]]?.['simple_img'];
      item['img'] = promotionImg?.[1] ?? promotionImg?.[0] ?? item['img_path'] ?? simpleImg;
    });

    console.log(`${key} historyList::`, historyList);

    setCardGroup((prev: any) => ({
      ...prev,
      [key]: {
        currentVersion: version,
        currentTimer: timer,
        historyList: historyList,
      },
    }));
  }

  async function fetchEachGameRole(key: string) {
    if (roleCache.current[key]) {
      console.log(`${key} 使用缓存的 role 数据`);
      return roleCache.current[key];
    }

    return fetch(`data/${key}/role.json`)
      .then((res) => res.json())
      .then((data) => {
        // console.log(`${key} role`, data);
        const tmp_role = data.reduce((acc, item) => {
          acc[item.title] = item;
          return acc;
        }, {});
        roleCache.current[key] = tmp_role;
        return tmp_role;
      })
      .catch((err) => {
        console.log(`${key} 无法获取角色信息，返回空.`, err);
        roleCache.current[key] = {};
        return {};
      });
  }
}
