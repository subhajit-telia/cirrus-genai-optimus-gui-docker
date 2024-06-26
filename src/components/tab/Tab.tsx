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
    <div className="border-b border-gray-200">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => changeTab(tab.id)}
            className={`${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
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
