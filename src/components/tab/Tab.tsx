import React, { useState } from 'react';

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
    </div>
  );
};

export default Tabs;
