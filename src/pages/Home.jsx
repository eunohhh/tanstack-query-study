import { useQuery } from "@tanstack/react-query";
import { todoApi } from "../api/todos";
import TodoForm from "../components/TodoForm";
import TodoList from "../components/TodoList";

export default function Home() {
    const {
        data: todos,
        isPending,
        error,
    } = useQuery({
        queryKey: ["todos"],
        queryFn: () => todoApi.get("/todos"),
        select: (data) => data.data,
    });

    if (isPending) {
        return <div style={{ fontSize: 36 }}>로딩중...</div>;
    }

    if (error) {
        console.error(error);
        return <div style={{ fontSize: 24 }}>에러가 발생했습니다: {error.message}</div>;
    }

    console.log(todos);

    return (
        <>
            <h2>서버통신 투두리스트 by useState</h2>
            <TodoForm />
            <TodoList todos={todos} />
        </>
    );
}
