-- postsテーブルとusernamesテーブルの関連付け
-- posts.user_idがusernamesテーブルを参照するように外部キー制約を追加

-- まず、usernamesテーブルにuser_id列が存在し、UUIDであることを確認
-- usernamesテーブルのuser_id列をUUIDに変更（もしTEXTだった場合）
DO $$
BEGIN
  -- user_id列の型をチェックして、必要ならUUIDに変更
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'usernames'
    AND column_name = 'user_id'
    AND data_type != 'uuid'
  ) THEN
    -- 既存データがある場合は型変換が必要
    ALTER TABLE usernames
    ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
  END IF;
END $$;

-- user_id列にユニーク制約がなければ追加
ALTER TABLE usernames
ADD CONSTRAINT usernames_user_id_unique UNIQUE (user_id);

-- postsテーブルからusernamesテーブルへの外部キー制約を追加
ALTER TABLE posts
ADD CONSTRAINT posts_user_id_fkey_usernames
FOREIGN KEY (user_id)
REFERENCES usernames(user_id)
ON DELETE CASCADE;

-- インデックスの作成（JOIN性能向上）
CREATE INDEX IF NOT EXISTS idx_usernames_user_id ON usernames(user_id);
