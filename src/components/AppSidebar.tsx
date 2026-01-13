import { Search, Home, Star, ChartNoAxesGantt, Heart, BookUser } from "lucide-react";
import styles from './BookCard.module.css';
import { NavLink } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";

const items = [
  { title: "Trang chủ", url: "/", icon: Home, style: styles['background-color-navy'] },
  { title: "Tìm kiếm", url: "/search", icon: Search, style: styles['background-color-rose'] },
  { title: "Tác giả", url: "/authors", icon: BookUser, style: styles['background-color-terracotta'] },
  { title: "Yêu thích", url: "/favorites", icon: Heart, style: styles['background-color-teal'] },
  { title: "Danh mục", url: "/categories", icon: ChartNoAxesGantt, style: styles['background-color-brown'] },
];

export function AppSidebar() {
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="mt-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider">
            Khám phá
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-8">
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        isActive
                          ? "bg-primary text-xs font-medium"
                          : "hover:bg-muted"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
