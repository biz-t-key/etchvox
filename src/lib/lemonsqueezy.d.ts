export { };

declare global {
    interface Window {
        LemonSqueezy: {
            Url: {
                Open: (url: string) => void;
                Close: () => void;
            };
            Setup: (options: {
                eventHandler: (event: { event: string; data: any }) => void;
            }) => void;
            Refresh: () => void;
        };
    }
}
