-- reactionsテーブルの作成
CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- 1ユーザーにつき1投稿に1リアクションまで
  CONSTRAINT reactions_post_user_unique UNIQUE (post_id, user_id)
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS reactions_post_id_idx ON reactions(post_id);
CREATE INDEX IF NOT EXISTS reactions_user_id_idx ON reactions(user_id);

-- Row Level Security (RLS) の有効化
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: 認証済みユーザーは自分のリアクションを追加/削除可能
CREATE POLICY "Users can manage their own reactions"
  ON reactions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLSポリシー: 全ユーザーがリアクションを閲覧可能
CREATE POLICY "Anyone can view reactions"
  ON reactions
  FOR SELECT
  TO authenticated
  USING (true);
