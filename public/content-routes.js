export const infoSlugs = {
 '/about-us':'about-us',
 '/legal/responsible-gaming':'responsible-gaming',
 '/legal/terms-and-conditions':'terms-and-conditions',
 '/legal/privacy-policy':'privacy-policy'
};
export function publishedPage(manifest,pathname){
 const slug=pathname==='/'||pathname==='/en'?'home':infoSlugs[pathname]||(pathname.startsWith('/promotions/')?pathname.split('/')[3]:null);
 return manifest?.pages?.find(p=>p.path===pathname)||manifest?.pages?.find(p=>p.slug===slug)||null;
}

