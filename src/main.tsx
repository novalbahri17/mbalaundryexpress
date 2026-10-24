import "./global.css";
import "@ant-design/v5-patch-for-react-19";
import { registerSW } from "virtual:pwa-register";
import ReactDOM from "react-dom/client";
import App from "./App";

if (import.meta.env.PROD) {
	registerSW({ immediate: true });
} else if ("serviceWorker" in navigator) {
	void navigator.serviceWorker.getRegistrations().then((registrations) => {
		for (const registration of registrations) {
			void registration.unregister();
		}
	});
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<App />);
