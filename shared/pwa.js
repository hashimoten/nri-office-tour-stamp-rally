export const registerPwa = async () => {
  if (!("serviceWorker" in navigator)) return null;

  const serviceWorkerUrl = new URL(
    `${import.meta.env.BASE_URL}service-worker.js`,
    window.location.origin,
  );

  try {
    return await navigator.serviceWorker.register(serviceWorkerUrl, {
      scope: import.meta.env.BASE_URL,
      updateViaCache: "none",
    });
  } catch {
    return null;
  }
};

