USE mermaid_db;

-- Desabilita temporariamente as verificações de chave estrangeira para evitar erros ao truncar tabelas
SET FOREIGN_KEY_CHECKS = 0;

-- Limpa todas as tabelas
TRUNCATE TABLE assigned_rights;
TRUNCATE TABLE music_heard;
TRUNCATE TABLE music_with_sealed_rights;
TRUNCATE TABLE musics;
TRUNCATE TABLE purchase_made;
TRUNCATE TABLE token_assigned;
TRUNCATE TABLE transferViaTokenSale;
TRUNCATE TABLE validated_music_contracts;
TRUNCATE TABLE WeiRefunded;
TRUNCATE TABLE withdrawal_rights;

-- Reabilita as verificações de chave estrangeira
SET FOREIGN_KEY_CHECKS = 1;

-- Exibe uma mensagem de sucesso
SELECT 'Database reset successfully.' AS Message;