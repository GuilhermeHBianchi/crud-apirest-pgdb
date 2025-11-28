import { Fornecedor } from './fornecedor.model.ts';

export interface Produto {
    id: number;
    nome: string;
    descricao?: string;
    preco: number;
    quantidade: number;
    categoria?: string;
    fornecedor_id?: number;
    fornecedor?: Fornecedor;
    created_at?: Date;
    updated_at?: Date;
}

export interface ProdutoCreate {
    nome: string;
    descricao?: string;
    preco: number;
    quantidade: number;
    categoria: string;  // Obrigatório
    fornecedor_id: number;  // Obrigatório
}

export interface ProdutoUpdate {
    nome?: string;
    descricao?: string;
    preco?: number;
    quantidade?: number;
    categoria?: string;
    fornecedor_id?: number;
}