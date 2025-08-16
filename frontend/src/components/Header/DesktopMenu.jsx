import React, { useEffect, useState, useCallback } from "react";
import { Menu } from "antd";
import { useLocation } from "react-router-dom";

export default function DesktopMenu({ items, onClick }) {
  const location = useLocation();
  const [selectedKeys, setSelectedKeys] = useState([]);

  const findSelectedKey = useCallback((items, path) => {
    for (let item of items) {
      if (item.children) {
        const found = findSelectedKey(item.children, path);
        if (found) return found;
      }
      const labelPath = item.label?.props?.to || item.label?.props?.href;
      if (labelPath === path) {
        return item.key;
      }
    }
    return null;
  }, []);

  useEffect(() => {
    const path = location.pathname;
    const keyMatch = findSelectedKey(items, path);
    if (keyMatch) {
      setSelectedKeys([keyMatch]);
    }
  }, [location.pathname, findSelectedKey, items]); 

  return (
    <Menu
      mode="horizontal"
      items={items}
      selectedKeys={selectedKeys}
      className="border-none bg-transparent flex-1 justify-center"
      selectable={true}
      onClick={onClick}
    />
  );
}
