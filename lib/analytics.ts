"use client";
// Analytics-ready event layer. No tracking is installed (owner consent + IDs required).
// Events are dispatched as `bf:analytics` CustomEvents so a consented provider can subscribe later.
export type AnalyticsEvent='search'|'filter'|'view_item'|'select_item'|'add_to_cart'|'start_film_configurator'|'finish_film_configurator'|'view_digitization'|'compare_digitization'|'click_passbilder'|'book_bewerbungsbilder'|'open_gallery'|'click_maps'|'click_call';
export function track(event:AnalyticsEvent,payload:Record<string,string|number|boolean|undefined>={}){
 if(typeof window==='undefined')return;
 window.dispatchEvent(new CustomEvent('bf:analytics',{detail:{event,payload,at:Date.now()}}));
}
