export function formatMessageTime(timestamp: number){
    const date = new Date(timestamp);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();

    const sameYear = date.getFullYear() === now.getFullYear();

    if(isToday){
        return date.toLocaleTimeString([],{
            hour: "numeric",
            minute: "2-digit"
        });
    }

    if(sameYear){
        return date.toLocaleDateString([],{
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    }

    return date.toLocaleString([], {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour:"numeric",
        minute: "2-digit",
    });
}