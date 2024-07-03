import { IonChip, IonIcon } from '@ionic/react';
import React, { useState } from 'react';
import { thumbsDownOutline, thumbsUpOutline } from 'ionicons/icons';

interface Tab {
    id: number;
    label: string;
    content: JSX.Element; // Assuming content is JSX.Element (React node)
}

interface TabsProps {
  tabs: Tab[];
}

const Tabs: React.FC<TabsProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(tabs[0].id); // Set the first tab as active initially

  const changeTab = (tabId: number) => {
    setActiveTab(tabId);
  };

  return (
    <div className="">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            type='button'
            key={tab.id}
            onClick={() => changeTab(tab.id)}
            className={`${
              activeTab === tab.id
                ? '!bg-white'
                : ''
            } bg-[#eaeaea] rounded-md rounded-tr-3xl rounded-br-none whitespace-nowrap py-1 px-4 border-b-2 font-medium text-sm focus:outline-none`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="bg-white p-4 rounded-md">
        {tabs.map((tab) => (
          <div key={tab.id} className={activeTab === tab.id ? 'block' : 'hidden'}>
            {tab.content}
          </div>
        ))}
      </div>
      <div className="flex mt-3 items-center justify-between">
        <div>
          <IonIcon className='mr-2.5 cursor-pointer hover:text-primary' slot="icon-only" icon={thumbsUpOutline}></IonIcon>
          <IonIcon className='mr-2.5 cursor-pointer hover:text-primary' slot="icon-only" icon={thumbsDownOutline}></IonIcon>
        </div>
        <div>
          <IonChip className='text-sm ml-2.5 mr-0 min-h-6 py-0 bg-white text-primary border-primary border-2 font-semibold rounded-lg'>Rewrite all suggestions</IonChip>
          <IonChip className='text-sm ml-2.5 mr-0 min-h-6 py-0 bg-white text-primary border-primary border-2 font-semibold rounded-lg'>Send to contentfull</IonChip>
          <IonChip className='text-sm ml-2.5 mr-0 min-h-6 py-0 bg-white text-primary border-primary border-2 font-semibold rounded-lg'>Save all suggestions to word.doc</IonChip>
          <IonChip className='text-sm ml-2.5 mr-0 min-h-6 py-0 bg-white text-primary border-primary border-2 font-semibold rounded-lg'>Create new task</IonChip>
        </div>
      </div>
    </div>
  );
};

export default Tabs;
