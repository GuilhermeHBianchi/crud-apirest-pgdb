import { Request, Response } from "express";
import userController from "../../controllers/user.controller.ts";
import userRepository from "../../repository/user.repository.ts";
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

  // ... demais testes iguais ...

  // ---------------- GET BY ID ----------------
  describe("getUserById", () => {
    // ... outros casos ...

    it("retorna 500 em caso de exceção", async () => {
      (userRepository.findById as jest.Mock).mockRejectedValue(new Error("DB error"));

      const { req, res } = mockRequestResponse({ params: { id: "1" } });

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Erro ao buscar usuário", // ✅ corrigido
        details: "DB error",
      });
    });
  });
});
