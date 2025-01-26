function App() {
    return (
        <div className="flex h-full w-full overflow-hidden">
            <aside className="h-full w-[260px] bg-gray-900"></aside>
            <main className="flex h-full grow flex-col bg-gray-800">
                <div className="flex-1 overflow-hidden">Messages section</div>
                <div className="">Input section</div>
            </main>
        </div>
    );
}

export default App;
