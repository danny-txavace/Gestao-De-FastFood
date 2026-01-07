/*
export async function preloadComponents() {
  const componentsToPreload = [
    () => import('../_pages/Management/Dashboard/dashboard-overview/dashboard-overview'),
    () => import('../_pages/Management/Dashboard/dashboard-sales/dashboard-sales'),
    () => import('../_pages/Management/Dashboard/dashboard-register/dashboard-register')
  ];


  const results = await Promise.allSettled(componentsToPreload.map(loader => loader()));

  results.forEach((result, index) => {
    const name = componentsToPreload[index].toString().match(/Dashboard\/(.*?)['"]/i)?.[1] || `Comp-${index + 1}`;
    if (result.status !== 'fulfilled') {
      console.error(`❌ Falha ao pré-carregar: ${name}`, result.reason);
    }
  });
}
*/
