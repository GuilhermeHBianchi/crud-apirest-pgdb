import { Request, Response } from "express";
import userController from "../../controllers/user.controller.js";
import userRepository from "../../repository/user.repository.js";
import jwt from "jsonwebtoken";

jest.mock("../../repository/user.repository", () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    comparePassword: jest.fn(),
  },
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));


const mockRequestResponse = (reqOverrides: Partial<Request> = {}) => {
  const req: Partial<Request> = {
    params: {},
    body: {},
    query: {},
    ...reqOverrides,
  };

  const res: Partial<Response> = {
    status: jest.fn(function (this: Response) {
      return this;
    }),
    json: jest.fn(),
  };

  return { req: req as Request, res: res as Response };
};

describe("UserController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---------------- CREATE ----------------
  describe("createUser", () => {
    it("retorna 400 se faltar campos obrigatórios", async () => {
      const { req, res } = mockRequestResponse({ body: { nome: "", email: "", senha: "" } });

      await userController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Nome, email e senha são obrigatórios" });
    });

    it("retorna 400 se email já cadastrado", async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue({ id: 1 });

      const { req, res } = mockRequestResponse({ body: { nome: "Teste", email: "a@a.com", senha: "123" } });

      await userController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Email já cadastrado" });
    });

    it("cria usuário com sucesso", async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (userRepository.create as jest.Mock).mockResolvedValue({ id: 1, nome: "Teste", email: "a@a.com", senha: "123" });

      const { req, res } = mockRequestResponse({ body: { nome: "Teste", email: "a@a.com", senha: "123" } });

      await userController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Usuário criado com sucesso",
        user: { id: 1, nome: "Teste", email: "a@a.com" },
      });
    });

    it("retorna 500 em caso de exceção", async () => {
      (userRepository.findByEmail as jest.Mock).mockRejectedValue(new Error("DB error"));

      const { req, res } = mockRequestResponse({ body: { nome: "Teste", email: "a@a.com", senha: "123" } });

      await userController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Erro ao criar usuário",
        details: "DB error",
      });
    });
  });

  // ---------------- LOGIN ----------------
  describe("login", () => {
    it("retorna 400 se faltar email ou senha", async () => {
      const { req, res } = mockRequestResponse({ body: { email: "", senha: "" } });

      await userController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Email e senha são obrigatórios" });
    });

    it("retorna 401 se usuário não encontrado", async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);

      const { req, res } = mockRequestResponse({ body: { email: "a@a.com", senha: "123" } });

      await userController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Credenciais inválidas" });
    });

    it("retorna 401 se senha inválida", async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue({ id: 1, email: "a@a.com", senha: "hashed" });
      (userRepository.comparePassword as jest.Mock).mockResolvedValue(false);

      const { req, res } = mockRequestResponse({ body: { email: "a@a.com", senha: "123" } });

      await userController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Credenciais inválidas" });
    });

    it("realiza login com sucesso", async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue({ id: 1, email: "a@a.com", senha: "hashed" });
      (userRepository.comparePassword as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue("fake-token");

      const { req, res } = mockRequestResponse({ body: { email: "a@a.com", senha: "123" } });

      await userController.login(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: "Login realizado com sucesso",
        token: "fake-token",
        user: { id: 1, email: "a@a.com" },
      });
    });

    it("retorna 500 em caso de exceção", async () => {
      (userRepository.findByEmail as jest.Mock).mockRejectedValue(new Error("DB error"));

      const { req, res } = mockRequestResponse({ body: { email: "a@a.com", senha: "123" } });

      await userController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Erro ao fazer login",
        details: "DB error",
      });
    });
  });

  // ---------------- GET ALL ----------------
  describe("getAllUsers", () => {
    it("retorna lista de usuários", async () => {
      (userRepository.findAll as jest.Mock).mockResolvedValue([{ id: 1 }]);

      const { req, res } = mockRequestResponse();

      await userController.getAllUsers(req, res);

      expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
    });

    it("retorna 500 em caso de exceção", async () => {
      (userRepository.findAll as jest.Mock).mockRejectedValue(new Error("DB error"));

      const { req, res } = mockRequestResponse();

      await userController.getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Erro ao buscar usuários",
        details: "DB error",
      });
    });
  });

  // ---------------- GET BY ID ----------------
  describe("getUserById", () => {
    it("retorna 400 se id inválido", async () => {
      const { req, res } = mockRequestResponse({ params: { id: "abc" } });

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "ID inválido" });
    });

    it("retorna 404 se usuário não encontrado", async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue(null);

      const { req, res } = mockRequestResponse({ params: { id: "1" } });

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Usuário não encontrado" });
    });

    it("retorna usuário se encontrado", async () => {
      (userRepository.findById as jest.Mock).mockResolvedValue({ id: 1 });

      const { req, res } = mockRequestResponse({ params: { id: "1" } });

      await userController.getUserById(req, res);

      expect(res.json).toHaveBeenCalledWith({ id: 1 });
    });

    it("retorna 500 em caso de exceção", async () => {
      (userRepository.findById as jest.Mock).mockRejectedValue(new Error("DB error"));

      const { req, res } = mockRequestResponse({ params: { id: "1" } });

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Erro ao buscar produto",
        details: "DB error",
      });
    });
  });
});
