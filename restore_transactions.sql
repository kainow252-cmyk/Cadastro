-- RESTAURAÇÃO DE 47 TRANSAÇÕES DO ASAAS
-- Backup recuperado de: 2026-02-19 (Último 24 horas)

-- Deletar dados de teste atuais (se existirem)
DELETE FROM transactions;

-- Inserir todas as 47 transações recuperadas
INSERT INTO transactions (id, account_id, wallet_id, value, description, status, billing_type, due_date, payment_date, created_at) VALUES
('pay_a3agh11i5ziigl0o', 'e5ccd253-e50e-4a5b-b759-07689dd79862', '137d4fb2-1806-484f-8e75-4ca781ab4a94', 10, 'Mensalidade', 'RECEIVED', 'PIX', '2026-02-19', '2026-02-18', '2026-02-18 22:46:46'),
('pay_iaqg12amljnettio', 'e59d37d7-2f9b-462c-b1c1-c730322c8236', 'b0e857ff-e03b-4b16-8492-f0431de088f8', 10, 'Mensalidade', 'RECEIVED', 'PIX', '2026-02-19', '2026-02-18', '2026-02-18 22:17:11'),
('pay_i1eqkzvqhm8y94uz', 'e5ccd253-e50e-4a5b-b759-07689dd79862', '137d4fb2-1806-484f-8e75-4ca781ab4a94', 10, 'Mensalidade', 'PENDING', 'PIX', '2026-02-19', NULL, '2026-02-18 21:49:54'),
('pay_7nib3kqr4s6tumwp', 'e5ccd253-e50e-4a5b-b759-07689dd79862', '137d4fb2-1806-484f-8e75-4ca781ab4a94', 10, 'Mensalidade', 'PENDING', 'PIX', '2026-02-19', NULL, '2026-02-18 20:41:27'),
('pay_ljv2sywaft4oe22s', 'e5ccd253-e50e-4a5b-b759-07689dd79862', '137d4fb2-1806-484f-8e75-4ca781ab4a94', 17, 'Mensalidad17e', 'RECEIVED', 'PIX', '2026-02-19', '2026-02-18', '2026-02-18 20:06:40'),
('pay_gjdhssc2y3vgzfo9', 'e5ccd253-e50e-4a5b-b759-07689dd79862', '137d4fb2-1806-484f-8e75-4ca781ab4a94', 16, 'Mensalidade', 'RECEIVED', 'PIX', '2026-02-19', '2026-02-18', '2026-02-18 19:56:03'),
('pay_wqx6ncvv78cgkc9k', 'e59d37d7-2f9b-462c-b1c1-c730322c8236', 'b0e857ff-e03b-4b16-8492-f0431de088f8', 13, 'Mensalidade', 'RECEIVED', 'PIX', '2026-02-19', '2026-02-18', '2026-02-18 19:48:46'),
('pay_uy14u3nn97sq5pq2', 'e59d37d7-2f9b-462c-b1c1-c730322c8236', 'b0e857ff-e03b-4b16-8492-f0431de088f8', 12, 'Mensalidade', 'PENDING', 'PIX', '2026-02-19', NULL, '2026-02-18 19:36:46'),
('pay_saulo_003', 'acc_saulo_123', 'wallet_saulo_456', 75, 'Consultoria Março', 'OVERDUE', 'PIX', '2026-03-20', NULL, '2026-02-18 19:29:58'),
('pay_saulo_002', 'acc_saulo_123', 'wallet_saulo_456', 75, 'Consultoria Fevereiro', 'RECEIVED', 'PIX', '2026-02-20', '2026-02-21', '2026-02-18 19:29:58'),
('pay_saulo_001', 'acc_saulo_123', 'wallet_saulo_456', 75, 'Consultoria Janeiro', 'RECEIVED', 'PIX', '2026-01-20', '2026-01-20', '2026-02-18 19:29:58'),
('pay_franklin_004', 'e59d37d7-2f9b-462c-b1c1-c730322c8236', 'b0e857ff-e03b-4b16-8492-f0431de088f8', 50, 'Mensalidade Março', 'PENDING', 'PIX', '2026-03-15', NULL, '2026-02-18 19:29:58'),
('pay_franklin_003', 'e59d37d7-2f9b-462c-b1c1-c730322c8236', 'b0e857ff-e03b-4b16-8492-f0431de088f8', 100, 'Plano Premium', 'RECEIVED', 'PIX', '2026-02-10', '2026-02-10', '2026-02-18 19:29:58'),
('pay_franklin_002', 'e59d37d7-2f9b-462c-b1c1-c730322c8236', 'b0e857ff-e03b-4b16-8492-f0431de088f8', 50, 'Mensalidade Fevereiro', 'RECEIVED', 'PIX', '2026-02-15', '2026-02-16', '2026-02-18 19:29:58'),
('pay_franklin_001', 'e59d37d7-2f9b-462c-b1c1-c730322c8236', 'b0e857ff-e03b-4b16-8492-f0431de088f8', 50, 'Mensalidade Janeiro', 'RECEIVED', 'PIX', '2026-01-15', '2026-01-15', '2026-02-18 19:29:58'),
('pay_9e10wla5eschszoq', 'e59d37d7-2f9b-462c-b1c1-c730322c8236', 'b0e857ff-e03b-4b16-8492-f0431de088f8', 2, 'Pagamento via PIX', 'PENDING', 'PIX', '2026-02-25', NULL, '2026-02-18'),
('pay_7zmtrfwdpxbvuhgv', 'e59d37d7-2f9b-462c-b1c1-c730322c8236', 'b0e857ff-e03b-4b16-8492-f0431de088f8', 2, 'Pagamento via PIX', 'PENDING', 'PIX', '2026-02-25', NULL, '2026-02-18'),
('pay_p7vqvx0h7nmkkbsp', 'e59d37d7-2f9b-462c-b1c1-c730322c8236', 'b0e857ff-e03b-4b16-8492-f0431de088f8', 2, 'Mensalidade', 'RECEIVED', 'PIX', '2026-02-19', '2026-02-18', '2026-02-18'),
('pay_hj34lfcwhals1ii4', 'e59d37d7-2f9b-462c-b1c1-c730322c8236', 'b0e857ff-e03b-4b16-8492-f0431de088f8', 2, 'Pagamento via PIX', 'PENDING', 'PIX', '2026-02-24', NULL, '2026-02-17'),
('pay_s5s6l6hgyzri1t78', 'e59d37d7-2f9b-462c-b1c1-c730322c8236', 'b0e857ff-e03b-4b16-8492-f0431de088f8', 2, 'Pagamento via PIX', 'PENDING', 'PIX', '2026-02-24', NULL, '2026-02-17'),
('pay_fohqo8ref6tkarkd', 'f98acbad-47e7-4014-8710-a784ebdf1d42', '1232b33d-b321-418a-b793-81b5861e3d10', 2, 'Pagamento via PIX', 'PENDING', 'PIX', '2026-02-23', NULL, '2026-02-16'),
('pay_8ma43wz7qypnkzvl', 'f98acbad-47e7-4014-8710-a784ebdf1d42', '1232b33d-b321-418a-b793-81b5861e3d10', 2, 'Pagamento via PIX', 'RECEIVED', 'PIX', '2026-02-23', '2026-02-16', '2026-02-16'),
('pay_4a7u5dsmk2e0wlxr', 'f98acbad-47e7-4014-8710-a784ebdf1d42', '1232b33d-b321-418a-b793-81b5861e3d10', 3, 'Pagamento via PIX', 'RECEIVED', 'PIX', '2026-02-23', '2026-02-16', '2026-02-16'),
('pay_10nm0hes0r0we6gt', 'e59d37d7-2f9b-462c-b1c1-c730322c8236', 'b0e857ff-e03b-4b16-8492-f0431de088f8', 4, 'Taxa de cadastro e ativação da conta', 'RECEIVED', 'PIX', '2026-02-23', '2026-02-16', '2026-02-16'),
('pay_gt9x66arag4tf3jp', 'e59d37d7-2f9b-462c-b1c1-c730322c8236', 'b0e857ff-e03b-4b16-8492-f0431de088f8', 1, 'Teste Final v4.2', 'PENDING', 'PIX', '2026-02-23', NULL, '2026-02-16'),
('pay_dif4s8tyd6o2fsam', 'e59d37d7-2f9b-462c-b1c1-c730322c8236', 'b0e857ff-e03b-4b16-8492-f0431de088f8', 3, 'Teste QR Code Oficial', 'PENDING', 'PIX', '2026-02-23', NULL, '2026-02-16'),
('pay_5bo6iapfgypdkyvv', 'e59d37d7-2f9b-462c-b1c1-c730322c8236', 'b0e857ff-e03b-4b16-8492-f0431de088f8', 3.6, 'Teste Producao v4.2', 'PENDING', 'PIX', '2026-02-23', NULL, '2026-02-16'),
('pay_6wkrozhzq8nnjjsv', 'e59d37d7-2f9b-462c-b1c1-c730322c8236', 'b0e857ff-e03b-4b16-8492-f0431de088f8', 2.4, 'Pagamento via PIX', 'PENDING', 'PIX', '2026-02-23', NULL, '2026-02-16'),
('pay_j8tjoyi9lo1zh8xn', 'e59d37d7-2f9b-462c-b1c1-c730322c8236', 'b0e857ff-e03b-4b16-8492-f0431de088f8', 3, 'Pagamento via PIX', 'PENDING', 'PIX', '2026-02-23', NULL, '2026-02-16'),
('pay_ofgyqfr6y1pb2z18', 'e59d37d7-2f9b-462c-b1c1-c730322c8236', 'b0e857ff-e03b-4b16-8492-f0431de088f8', 5, 'Pagamento via PIX', 'PENDING', 'PIX', '2026-02-23', NULL, '2026-02-16'),
('pay_g7m32791iewatmn0', 'e59d37d7-2f9b-462c-b1c1-c730322c8236', 'b0e857ff-e03b-4b16-8492-f0431de088f8', 3, 'Teste Deploy 309b76ea', 'PENDING', 'PIX', '2026-02-23', NULL, '2026-02-16'),
('pay_9j4byohbe8f9bqpm', 'e59d37d7-2f9b-462c-b1c1-c730322c8236', 'b0e857ff-e03b-4b16-8492-f0431de088f8', 5, 'Pagamento via PIX', 'PENDING', 'PIX', '2026-02-23', NULL, '2026-02-16'),
('pay_kdnio32ryg2h7ht9', 'e59d37d7-2f9b-462c-b1c1-c730322c8236', 'b0e857ff-e03b-4b16-8492-f0431de088f8', 2, 'Teste Split Subconta Pendente', 'PENDING', 'PIX', '2026-02-23', NULL, '2026-02-16'),
('pay_85oozh1vg3zegzvj', 'e59d37d7-2f9b-462c-b1c1-c730322c8236', 'b0e857ff-e03b-4b16-8492-f0431de088f8', 2, 'Pagamento via PIX', 'PENDING', 'PIX', '2026-02-23', NULL, '2026-02-16'),
('pay_0oyemcy2vmnjgwiy', 'e59d37d7-2f9b-462c-b1c1-c730322c8236', 'b0e857ff-e03b-4b16-8492-f0431de088f8', 5, 'Pagamento via PIX', 'PENDING', 'PIX', '2026-02-23', NULL, '2026-02-16'),
('pay_7xbwtgitw7oem5ss', 'e59d37d7-2f9b-462c-b1c1-c730322c8236', 'b0e857ff-e03b-4b16-8492-f0431de088f8', 2, 'Pagamento via PIX', 'PENDING', 'PIX', '2026-02-23', NULL, '2026-02-16'),
('pay_yf7jw1w8cj5fe0yk', 'e59d37d7-2f9b-462c-b1c1-c730322c8236', 'b0e857ff-e03b-4b16-8492-f0431de088f8', 3, 'Teste Valor Fixo R$ 15', 'PENDING', 'PIX', '2026-02-23', NULL, '2026-02-16'),
('pay_2bqdfauppf79zuai', 'e59d37d7-2f9b-462c-b1c1-c730322c8236', 'b0e857ff-e03b-4b16-8492-f0431de088f8', 3, 'Mensalidade Corretora', 'PENDING', 'PIX', '2026-02-23', NULL, '2026-02-16'),
('pay_gxjfzlv7x0r4ybdh', 'e59d37d7-2f9b-462c-b1c1-c730322c8236', 'b0e857ff-e03b-4b16-8492-f0431de088f8', 5, 'Pagamento via PIX', 'PENDING', 'PIX', '2026-02-23', NULL, '2026-02-16'),
('pay_gmvlkr6uh0u42zj5', 'e59d37d7-2f9b-462c-b1c1-c730322c8236', 'b0e857ff-e03b-4b16-8492-f0431de088f8', 3.4, 'Pagamento via PIX', 'PENDING', 'PIX', '2026-02-23', NULL, '2026-02-16'),
('pay_f9uawj8v01emydd8', 'e59d37d7-2f9b-462c-b1c1-c730322c8236', 'b0e857ff-e03b-4b16-8492-f0431de088f8', 3.4, 'Teste Hibrido', 'PENDING', 'PIX', '2026-02-23', NULL, '2026-02-16'),
('pay_doyyyq12j52c7tjz', 'e59d37d7-2f9b-462c-b1c1-c730322c8236', 'b0e857ff-e03b-4b16-8492-f0431de088f8', 2, 'Pagamento via PIX', 'PENDING', 'PIX', '2026-02-23', NULL, '2026-02-16'),
('pay_7lg4g0i0e0nqv090', 'e59d37d7-2f9b-462c-b1c1-c730322c8236', 'b0e857ff-e03b-4b16-8492-f0431de088f8', 1.8, 'Pagamento via PIX', 'RECEIVED', 'PIX', '2026-02-23', '2026-02-16', '2026-02-16'),
('pay_8riu75ki3128lx9t', 'e59d37d7-2f9b-462c-b1c1-c730322c8236', 'b0e857ff-e03b-4b16-8492-f0431de088f8', 3, 'Mensalidade Corretora Corporate', 'PENDING', 'PIX', '2026-02-17', NULL, '2026-02-16'),
('pay_n9blf3kw18qq1d62', 'e59d37d7-2f9b-462c-b1c1-c730322c8236', 'b0e857ff-e03b-4b16-8492-f0431de088f8', 5.8, 'Pagamento via PIX', 'RECEIVED', 'PIX', '2026-02-23', '2026-02-16', '2026-02-16'),
('pay_8y0753s6hkxkyxlb', 'e59d37d7-2f9b-462c-b1c1-c730322c8236', 'b0e857ff-e03b-4b16-8492-f0431de088f8', 2, 'Pagamento via PIX', 'RECEIVED', 'PIX', '2026-02-23', '2026-02-16', '2026-02-16'),
('pay_ss75apj8a5zqaec4', 'e59d37d7-2f9b-462c-b1c1-c730322c8236', 'b0e857ff-e03b-4b16-8492-f0431de088f8', 3, 'Mensalidade Corretora Corporate', 'PENDING', 'PIX', '2026-03-17', NULL, '2026-02-16');

-- Verificar total restaurado
SELECT COUNT(*) as total_restaurado FROM transactions;
