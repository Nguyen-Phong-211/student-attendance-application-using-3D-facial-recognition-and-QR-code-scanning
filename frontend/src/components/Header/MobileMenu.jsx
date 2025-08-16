import React from "react";
import { Menu } from "antd";

export default function MobileMenu({ items }) {
  return (
    <Menu
      mode="vertical"
      items={items}
      className="border-none"
      selectable={false}
      // popupClassName="custom-dropdown-menu"
    />
  );
}
