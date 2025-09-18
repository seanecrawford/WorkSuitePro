import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, BarChart3, Settings, Briefcase, Users, 
  MessageSquare, GraduationCap, HeartHandshake, ShieldCheck, CalendarCheck, Workflow, 
  BookOpen as AcademyIcon, SlidersHorizontal, LayoutTemplate, Map, BarChartHorizontal, UserCog
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const location = useLocation();
  const [openAccordionItems, setOpenAccordionItems] = useState([]);
  
  const userRole = 'Admin'; // Mock role since auth is removed

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home, section: 'main', roles: ['Admin', 'Manager', 'Employee'] }, 
    { 
      name: 'Operations', 
      icon: Workflow, 
      section: 'main',
      id: 'operations',
      roles: ['Admin', 'Manager', 'Employee'],
      subItems: [
        { name: 'Project Management', path: '/project-management', icon: Briefcase, roles: ['Admin', 'Manager', 'Employee'] },
        { name: 'Task Board', path: '/task-board', icon: LayoutTemplate, roles: ['Admin', 'Manager', 'Employee'] },
        { name: 'Scheduling', path: '/scheduling', icon: CalendarCheck, roles: ['Admin', 'Manager', 'Employee'] },
        { name: 'Resource Overview', path: '/resource-overview', icon: Map, roles: ['Admin', 'Manager'] },
      ]
    },
    { 
      name: 'Business Suite', 
      icon: Briefcase, 
      section: 'main',
      id: 'business-suite',
      roles: ['Admin', 'Manager'],
      subItems: [
        { name: 'Analytics', path: '/analytics', icon: BarChartHorizontal, roles: ['Admin', 'Manager'] },
        { name: 'Finance Hub', path: '/finance-hub', icon: BarChart3, roles: ['Admin', 'Manager'] },
        { name: 'Team Management', path: '/team-management', icon: Users, roles: ['Admin', 'Manager'] },
        { name: 'Human Resources', path: '/human-resources', icon: HeartHandshake, roles: ['Admin', 'Manager'] },
      ]
    },
    { 
      name: 'Company Tools', 
      icon: Users, 
      section: 'main',
      id: 'company-tools', 
      roles: ['Admin', 'Manager', 'Employee'],
      subItems: [
        { name: 'Communication Hub', path: '/communication-hub', icon: MessageSquare, roles: ['Admin', 'Manager', 'Employee'] },
        { name: 'Work Suite Academy', path: '/academy', icon: AcademyIcon, roles: ['Admin', 'Manager', 'Employee'] }, 
      ]
    },
    { 
      name: 'System', 
      icon: Settings, 
      section: 'config', 
      id: 'system-info',
      roles: ['Admin', 'Manager', 'Employee'],
      subItems: [
        { name: 'Profile', path: '/profile', icon: UserCog, roles: ['Admin', 'Manager', 'Employee'] },
        { name: 'Settings', path: '/settings', icon: Settings, roles: ['Admin', 'Manager', 'Employee'] },
        { name: 'Data Management', path: '/data-management', icon: SlidersHorizontal, roles: ['Admin'] },
        { name: 'Data Sources', path: '/data-sources', icon: SlidersHorizontal, roles: ['Admin'] },
        { name: 'Admin', path: '/admin', icon: ShieldCheck, devOnly: true, roles: ['Admin'] },
      ]
    },
  ];

  useEffect(() => {
    const activeParent = navItems.find(item => item.subItems && item.subItems.some(sub => location.pathname.startsWith(sub.path) && sub.path !== '/'));
    if (activeParent && !openAccordionItems.includes(activeParent.id)) {
      setOpenAccordionItems(prev => [...prev, activeParent.id]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const baseLinkClass = "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ease-in-out group";
  
  const getLinkClass = (path) => {
    const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
    if (isActive) {
      return cn(baseLinkClass, 'font-semibold text-sidebar-themed-active-item-foreground bg-sidebar-themed-active-item hover:bg-sidebar-hover-themed'); 
    }
    return cn(baseLinkClass, 'text-sidebar-themed-default sidebar-item-hover bg-transparent hover:bg-sidebar-hover-themed');
  };
  
  const getAccordionTriggerClass = (isParentActive) => {
    if (isParentActive) {
      return cn(baseLinkClass, "hover:no-underline justify-start py-2 font-semibold text-sidebar-themed-active bg-transparent hover:bg-sidebar-hover-themed");
    }
    return cn(baseLinkClass, "hover:no-underline justify-start py-2 text-sidebar-themed-default sidebar-item-hover font-medium bg-transparent hover:bg-sidebar-hover-themed");
  };

  const getIconClass = (isActiveOrParentActive) => {
    if (isActiveOrParentActive) {
      return "h-5 w-5 mr-3 flex-shrink-0 text-sidebar-themed-active";
    }
    return "h-5 w-5 mr-3 flex-shrink-0 icon-sidebar-themed-default group-hover:text-sidebar-themed-active";
  };
  
  const getSubIconClass = (isSubItemActive) => {
     if (isSubItemActive) {
      return "h-4 w-4 mr-2.5 flex-shrink-0 text-sidebar-themed-active-item-foreground";
    }
    return "h-4 w-4 mr-2.5 flex-shrink-0 icon-sidebar-themed-default opacity-80 group-hover:text-sidebar-themed-active-item-foreground group-hover:opacity-100";
  }

  const renderNavItems = (itemsToRender) => {
    return itemsToRender.map((item) => {
      if (!item.roles.includes(userRole)) return null;

      if (item.subItems) {
        const visibleSubItems = item.subItems.filter(sub => sub.roles.includes(userRole));
        if (visibleSubItems.length === 0) return null;

        const isParentActive = visibleSubItems.some(subItem => location.pathname.startsWith(subItem.path) && subItem.path !== '/');
        return (
          <AccordionItem key={item.id} value={item.id} className="border-b-0">
            <AccordionTrigger className={getAccordionTriggerClass(isParentActive)}>
              <item.icon className={getIconClass(isParentActive)} />
              <span className="flex-grow text-left">{item.name}</span>
            </AccordionTrigger>
            <AccordionContent className="pl-6 mt-0.5 space-y-0.5 border-l border-[var(--theme-border-divider)] ml-[1.125rem] mr-2">
              {visibleSubItems.map(subItem => {
                const isSubItemActive = location.pathname.startsWith(subItem.path) && subItem.path !== '/';
                return (
                  <NavLink key={subItem.name} to={subItem.path} className={getLinkClass(subItem.path)}>
                    <subItem.icon className={getSubIconClass(isSubItemActive)} />
                    {subItem.name}
                  </NavLink>
                );
              })}
            </AccordionContent>
          </AccordionItem>
        );
      }

      const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
      return (
        <NavLink key={item.name} to={item.path} className={getLinkClass(item.path)} >
          <item.icon className={getIconClass(isActive)} />
          {item.name}
        </NavLink>
      );
    });
  };

  return (
    <div className={`h-full flex flex-col bg-sidebar-themed border-r border-[var(--theme-border-primary)] shadow-lg`}>
      <Accordion 
        type="multiple" 
        className="flex-1 space-y-0.5 p-2.5 pt-4 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--theme-border-input)] scrollbar-track-[var(--theme-bg-sidebar)]"
        value={openAccordionItems}
        onValueChange={setOpenAccordionItems}
      >
        {renderNavItems(navItems.filter(item => item.section === 'main'))}
      </Accordion>

      <div className="p-3 border-t border-[var(--theme-border-divider)]">
        <Accordion 
          type="multiple" 
          className="space-y-0.5"
          value={openAccordionItems} 
          onValueChange={setOpenAccordionItems}
        >
          {renderNavItems(navItems.filter(item => item.section === 'config'))}
        </Accordion>
        
        <div className="mt-3">
          <div className="space-y-2">
            <div className="flex items-center space-x-3 p-2.5 rounded-lg bg-card-alt-themed border border-border">
              <UserCog className="h-8 w-8 text-[var(--theme-accent-primary)]" />
              <div>
                <p className="text-xs font-semibold text-foreground truncate max-w-[130px]">Guest User</p>
                <p className="text-[10px] text-muted-foreground">{userRole} (Demo)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;