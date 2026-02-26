export interface Todo {
  readonly id: string;
  readonly title: string;
  readonly completed: boolean;
  readonly createdAt: string;
}

export interface CreateTodoInput {
  readonly title: string;
}

export interface UpdateTodoInput {
  readonly title?: string;
  readonly completed?: boolean;
}
