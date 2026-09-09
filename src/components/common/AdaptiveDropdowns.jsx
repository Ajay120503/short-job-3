import { useEffect } from "react";
import { getDropdownPosition } from "../../utils/dropdownPosition";

// Enhance the existing action menus without moving their React-owned nodes.
// Native popovers escape overflow containers and stacking contexts.
export default function AdaptiveDropdowns() {
  useEffect(() => {
    let active = null;
    let resizeObserver = null;
    let frame = 0;
    const enhanced = new Map();
    const items = (menu) => [...menu.querySelectorAll('button:not(:disabled), a[href]')]
      .filter((item) => item.getClientRects().length);
    const close = (restoreFocus = false) => {
      if (!active) return;
      const { menu, trigger } = active;
      active = null;
      resizeObserver?.disconnect();
      cancelAnimationFrame(frame);
      if ('hidePopover' in menu && menu.matches(':popover-open')) menu.hidePopover();
      delete menu.dataset.adaptiveOpen;
      trigger.setAttribute('aria-expanded', 'false');
      if (restoreFocus && trigger.isConnected) trigger.focus();
    };
    const position = () => {
      if (!active) return;
      const { menu, trigger } = active;
      if (!trigger.isConnected || !menu.isConnected) return close();
      const viewport = window.visualViewport;
      const left = viewport?.offsetLeft || 0;
      const top = viewport?.offsetTop || 0;
      const width = viewport?.width || window.innerWidth;
      const height = viewport?.height || window.innerHeight;
      const rect = trigger.getBoundingClientRect();
      if (rect.bottom < top || rect.top > top + height) return close();
      menu.style.width = `${Math.min(240, width - 16)}px`;
      menu.style.maxHeight = 'none';
      const box = menu.getBoundingClientRect();
      const placement = getDropdownPosition(rect, { width: box.width, height: box.height }, { left, top, width, height });
      menu.style.width = `${placement.width}px`;
      menu.style.maxHeight = `${placement.maxHeight}px`;
      menu.style.left = `${placement.left}px`;
      menu.style.top = `${placement.top}px`;
      menu.dataset.placement = placement.side;
    };
    const open = (trigger, menu, focusFirst = false) => {
      close();
      if (!enhanced.has(menu)) {
        enhanced.set(menu, { style: menu.getAttribute('style'), popover: menu.getAttribute('popover'), trigger,
          expanded: trigger.getAttribute('aria-expanded'), label: trigger.getAttribute('aria-label') });
        menu.dataset.adaptiveMenu = '';
        if ('showPopover' in menu) menu.setAttribute('popover', 'manual');
        if (!trigger.textContent.trim() && !trigger.hasAttribute('aria-label')) trigger.setAttribute('aria-label', 'More actions');
      }
      active = { trigger, menu };
      menu.dataset.adaptiveOpen = '';
      trigger.setAttribute('aria-expanded', 'true');
      if ('showPopover' in menu) menu.showPopover();
      position();
      resizeObserver = new ResizeObserver(() => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(position);
      });
      // Observe content rather than the constrained menu to avoid resize loops.
      [...menu.children, trigger].forEach((element) => resizeObserver.observe(element));
      if (focusFirst) items(menu)[0]?.focus();
    };
    const resolve = (target) => {
      if (!(target instanceof Element)) return null;
      const wrapper = target.closest('.dropdown');
      if (!wrapper) return null;
      const menu = wrapper.querySelector(':scope > .dropdown-content.menu');
      const trigger = wrapper.querySelector(':scope > button, :scope > [role="button"]');
      return menu && trigger && trigger.contains(target) ? { menu, trigger } : null;
    };
    const onClick = (event) => {
      const found = resolve(event.target);
      if (found) {
        event.preventDefault();
        if (active?.menu === found.menu) close(true);
        else open(found.trigger, found.menu);
      } else if (active && !active.menu.contains(event.target)) close();
      else if (active && event.target.closest('button, a[href]')) {
        // Let React execute the action before dismissing its menu.
        queueMicrotask(() => close());
      }
    };
    const onKey = (event) => {
      const found = resolve(event.target);
      if (found && event.key === 'ArrowDown') {
        event.preventDefault();
        open(found.trigger, found.menu, true);
      } else if (active && event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        close(true);
      } else if (active && active.menu.contains(event.target) && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        const options = items(active.menu);
        const index = options.indexOf(document.activeElement);
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 :
          (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
        options[next]?.focus();
      }
    };
    const onFocus = (event) => {
      if (active && !active.menu.contains(event.target) && !active.trigger.contains(event.target)) close();
    };
    const onScroll = (event) => {
      if (active && !active.menu.contains(event.target instanceof Node ? event.target : null)) position();
    };
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('focusin', onFocus);
    document.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', position);
    window.visualViewport?.addEventListener('resize', position);
    window.visualViewport?.addEventListener('scroll', position);
    return () => {
      close();
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('keydown', onKey, true);
      document.removeEventListener('focusin', onFocus);
      document.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', position);
      window.visualViewport?.removeEventListener('resize', position);
      window.visualViewport?.removeEventListener('scroll', position);
      for (const [menu, previous] of enhanced) {
        delete menu.dataset.adaptiveMenu;
        delete menu.dataset.placement;
        for (const name of ['style', 'popover']) {
          if (previous[name] === null) menu.removeAttribute(name);
          else menu.setAttribute(name, previous[name]);
        }
        for (const [name, value] of [['aria-expanded', previous.expanded], ['aria-label', previous.label]]) {
          if (value === null) previous.trigger.removeAttribute(name);
          else previous.trigger.setAttribute(name, value);
        }
      }
    };
  }, []);
  return null;
}
