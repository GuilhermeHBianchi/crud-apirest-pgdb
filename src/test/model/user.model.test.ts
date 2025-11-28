import { User, UserCreate, UserLogin } from "../../models/user.model.ts";

describe("User model", () => {
  it("deveria criar um usuário válido", () => {
    const user: User = {
      id: 1,
      nome: "Guilherme",
      email: "gui@example.com",
      senha: "123456",
    };
    /*Ola*/
    expect(user.id).toBe(1);
    expect(user.nome).toBe("Guilherme");
    expect(user.email).toBe("gui@example.com");
    expect(user.senha).toBe("123456");
  });

  it("deveria criar um UserCreate", () => {
    const novo: UserCreate = {
      nome: "Novo Usuário",
      email: "novo@example.com",
      senha: "senha123",
    };

    expect(novo.nome).toBe("Novo Usuário");
    expect(novo.email).toBe("novo@example.com");
  });

  it("deveria criar um UserLogin", () => {
    const login: UserLogin = {
      email: "login@example.com",
      senha: "senha123",
    };

    expect(login.email).toBe("login@example.com");
    expect(login.senha).toBe("senha123");
  });
});
