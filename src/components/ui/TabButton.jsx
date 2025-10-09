const TabButton = ({ active, onClick, children }) => (
    <button
        className={`flex-1 py-2 px-4 text-sm font-medium text-center rounded-t-lg transition-colors duration-200 ${active ? 'bg-primary text-primary-foreground' : 'bg-base-200 hover:bg-base-300'}`}
        onClick={onClick}
    >
        {children}
    </button>
);

export default TabButton;