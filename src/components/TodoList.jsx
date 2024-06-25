import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { todoApi } from "../api/todos";

export default function TodoList() {
    const navigate = useNavigate();
    const {
        data: todos,
        error,
        isPending,
    } = useQuery({
        queryKey: ["todos"],
        queryFn: async () => {
            const response = await todoApi.get("/todos");
            return response.data;
        },
    });

    // TODO: 아래 handleLike 로 구현되어 있는 부분을 useMutation 으로 리팩터링 해보세요. 모든 기능은 동일하게 동작해야 합니다.
    const queryClient = useQueryClient();

    const { mutate } = useMutation({
        // 기본 뮤테이션 함수
        mutationFn: ({ id, currentLiked }) =>
            todoApi.patch(`/todos/${id}`, {
                liked: !currentLiked,
            }),
        // 뮤테이션 실행 전 상태 저장
        // newTodo 는 뮤테이션 함수의 인자로 전달되는 값 === 추가될 새로운 데이터
        onMutate: async ({ id }) => {
            // 진행중인 쿼리를 무효화
            // optimistic update 를 덮어쓰지 않기 위해
            await queryClient.cancelQueries({ queryKey: ["todos"] });

            // 이전 상태를 변수에 저장
            const previousTodos = queryClient.getQueryData(["todos"]);

            // ***** 여기가 optimistic update 입니다. 쿼리 데이터를 일단 새로운 데이터로 업데이트 합니다. *****
            queryClient.setQueryData(["todos"], (prev) =>
                prev.map((todo) => (todo.id === id ? { ...todo, liked: !todo.liked } : todo))
            );

            // 저장 해두었던 이전 상태를 반환
            return { previousTodos };
        },
        // 쿼리 실행중 에러가 발생하면 이전 상태로 되돌립니다.
        onError: (err, newTodo, context) => {
            queryClient.setQueryData(["todos"], context.previousTodos);
        },
        // 성공하거나 실패하거나 둘 중 한가지라도 실행되면 쿼리를 무효화합니다. === 리페치 합니다.
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["todos"] });
        },
    });

    const handleLike = async (id, currentLiked) => {
        mutate({ id, currentLiked });
    };

    if (isPending) {
        return <div style={{ fontSize: 36 }}>로딩중...</div>;
    }

    if (error) {
        console.error(error);
        return <div style={{ fontSize: 24 }}>에러가 발생했습니다: {error.message}</div>;
    }

    return (
        <ul style={{ listStyle: "none", width: 250 }}>
            {todos.map((todo) => (
                <li
                    key={todo.id}
                    style={{
                        border: "1px solid black",
                        padding: "10px",
                        marginBottom: "10px",
                    }}
                >
                    <h3>{todo.title}</h3>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <button onClick={() => navigate(`/detail/${todo.id}`)}>내용보기</button>
                        {todo.liked ? (
                            <FaHeart
                                onClick={() => handleLike(todo.id, todo.liked)}
                                style={{ cursor: "pointer" }}
                            />
                        ) : (
                            <FaRegHeart
                                onClick={() => handleLike(todo.id, todo.liked)}
                                style={{ cursor: "pointer" }}
                            />
                        )}
                    </div>
                </li>
            ))}
        </ul>
    );
}
