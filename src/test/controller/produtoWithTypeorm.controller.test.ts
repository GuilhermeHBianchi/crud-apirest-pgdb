import { Request, Response } from "express";
import produtoController from "../../controllers/produto.controller.ts";
import produtoRepository from "../../repository/produto.repository.ts";

jest.mock("../../repository/produto.repository.ts", () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    findByCategoria: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    updateQuantidade: jest.fn(),
  },
}));

jest.mock("../../repository/fornecedor.repository.ts", () => ({
  __esModule: true,
  default: { findById: jest.fn() },
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

describe("ProdutoController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---------------- CREATE ----------------
  describe("createProduto", () => {
    it("retorna 400 se faltar campos obrigatórios", async () => {
      const { req, res } = mockRequestResponse({
        body: { nome: "", preco: null, quantidade: null, categoria: "", fornecedor_id: null },
      });

      await produtoController.createProduto(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Campos obrigatórios faltando" })
      );
    });

    it("retorna 400 se preço for negativo", async () => {
      const { req, res } = mockRequestResponse({
        body: { nome: "Teste", preco: -10, quantidade: 5, categoria: "A", fornecedor_id: 1 },
      });

      await produtoController.createProduto(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Preço não pode ser negativo" });
    });

    it("retorna 400 se quantidade for negativa", async () => {
      const { req, res } = mockRequestResponse({
        body: { nome: "Teste", preco: 10, quantidade: -5, categoria: "A", fornecedor_id: 1 },
      });

      await produtoController.createProduto(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Quantidade não pode ser negativa" });
    });

    it("retorna 400 se fornecedor não existir", async () => {
      const fornecedorRepository = (await import("../../repository/fornecedor.repository.ts")).default;
      (fornecedorRepository.findById as jest.Mock).mockResolvedValue(null);

      const { req, res } = mockRequestResponse({
        body: { nome: "Teste", preco: 10, quantidade: 5, categoria: "A", fornecedor_id: 99 },
      });

      await produtoController.createProduto(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Fornecedor não encontrado" });
    });

    it("cria produto com sucesso", async () => {
      const fornecedorRepository = (await import("../../repository/fornecedor.repository.ts")).default;
      (fornecedorRepository.findById as jest.Mock).mockResolvedValue({ id: 1 });

      (produtoRepository.create as jest.Mock).mockResolvedValue({ id: 1, nome: "Teste" });

      const { req, res } = mockRequestResponse({
        body: { nome: "Teste", preco: 10, quantidade: 5, categoria: "A", fornecedor_id: 1 },
      });

      await produtoController.createProduto(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Produto criado com sucesso",
        produto: { id: 1, nome: "Teste" },
      });
    });

    it("retorna 500 em caso de exceção", async () => {
      (produtoRepository.create as jest.Mock).mockRejectedValue(new Error("DB error"));

      const fornecedorRepository = (await import("../../repository/fornecedor.repository.ts")).default;
      (fornecedorRepository.findById as jest.Mock).mockResolvedValue({ id: 1 });

      const { req, res } = mockRequestResponse({
        body: { nome: "Teste", preco: 10, quantidade: 5, categoria: "A", fornecedor_id: 1 },
      });

      await produtoController.createProduto(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Erro ao criar produto",
        details: "DB error",
      });
    });
  });

  // ---------------- GET ALL ----------------
  describe("getAllProdutos", () => {
    it("retorna todos os produtos", async () => {
      (produtoRepository.findAll as jest.Mock).mockResolvedValue([{ id: 1 }]);

      const { req, res } = mockRequestResponse();

      await produtoController.getAllProdutos(req, res);

      expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
    });

    it("retorna produtos filtrados por categoria", async () => {
      (produtoRepository.findByCategoria as jest.Mock).mockResolvedValue([{ id: 2 }]);

      const { req, res } = mockRequestResponse({ query: { categoria: "A" } });

      await produtoController.getAllProdutos(req, res);

      expect(res.json).toHaveBeenCalledWith([{ id: 2 }]);
    });

    it("retorna 500 em caso de exceção", async () => {
      (produtoRepository.findAll as jest.Mock).mockRejectedValue(new Error("DB error"));

      const { req, res } = mockRequestResponse();

      await produtoController.getAllProdutos(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Erro ao buscar produtos",
        details: "DB error",
      });
    });
  });

  // ---------------- GET BY ID ----------------
  describe("getProdutoById", () => {
    it("retorna 400 se id inválido", async () => {
      const { req, res } = mockRequestResponse({ params: { id: "abc" } });

      await produtoController.getProdutoById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "ID inválido" });
    });

    it("retorna 404 se produto não encontrado", async () => {
      (produtoRepository.findById as jest.Mock).mockResolvedValue(null);

      const { req, res } = mockRequestResponse({ params: { id: "1" } });

      await produtoController.getProdutoById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Produto não encontrado" });
    });

    it("retorna produto se encontrado", async () => {
      (produtoRepository.findById as jest.Mock).mockResolvedValue({ id: 1 });

      const { req, res } = mockRequestResponse({ params: { id: "1" } });

      await produtoController.getProdutoById(req, res);

      expect(res.json).toHaveBeenCalledWith({ id: 1 });
    });

    it("retorna 500 em caso de exceção", async () => {
      (produtoRepository.findById as jest.Mock).mockRejectedValue(new Error("DB error"));

      const { req, res } = mockRequestResponse({ params: { id: "1" } });

      await produtoController.getProdutoById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Erro ao buscar produto",
        details: "DB error",
      });
    });
  });
});
