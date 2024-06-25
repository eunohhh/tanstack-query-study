import QueryProvider from "./Provider/QueryProvider";
import Router from "./shared/Router";

function App() {
    return (
        <QueryProvider>
            <Router />
        </QueryProvider>
    );
}

export default App;
