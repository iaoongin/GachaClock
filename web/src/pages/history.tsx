import { CountdownTimer, CardPool } from '@/components/card-pool';
import DefaultLayout from '@/layouts/default';
import { Accordion, AccordionItem } from '@heroui/react';
import { groupBy } from 'lodash';
import { useEffect, useState } from 'react';
import { useLocalStorage } from 'react-use';
import { useParams } from 'react-router-dom';

export default function HistoryPage() {
  const [cardGroup, setCardGroup] = useState<any>({});
  const [titleMap, setTitleMap] = useState<any>({});
  const [expandedKeys, setExpandedKeys] = useLocalStorage('history/expandedKeys', null); // 初始值为空
  let { key } = useParams();

  console.log('key:::', key);

  useEffect(() => {
    if (!key) {
      return;
    }
    fetch(`/data/${key}/history.json`)
      .then((res) => res.json())
      .then((data) => {
        console.log('data:::', data);
        data.forEach((element) => {
          element.img_path = '/' + element.img_path;
        });
        let versionGroup = groupBy(data, 'version');
        console.log('versionGroup:::', versionGroup);

        // 设置group
        setCardGroup(versionGroup);

        // 设置title
        Object.keys(versionGroup).forEach((key) => {
          setTitleMap((pre) => {
            return {
              ...pre,
              [key]: `${versionGroup[key][0].timer} ${versionGroup[key]
                .filter((item) => item.type === '角色')
                .map((item) => item.s)
                .join('、')}`,
            };
          });
        });
      });
  }, []);

  if (key == 'ww') {
    return (
      <DefaultLayout>
        <div>暂未支持</div>
      </DefaultLayout>
    );
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
            .sort((a, b) => b.localeCompare(a))
            .map((key) => (
              <AccordionItem key={key} aria-label={key} startContent={key} subtitle={titleMap[key]}>
                <CardPool historyList={cardGroup[key]} />
              </AccordionItem>
            ))}
        </Accordion>
      </div>
    </DefaultLayout>
  );
}
