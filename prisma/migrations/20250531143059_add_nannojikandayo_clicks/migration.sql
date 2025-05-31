-- CreateTable
CREATE TABLE "Question" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notification_token" TEXT,
    "submitter_nickname" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "question_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "image_url" TEXT,
    "link_url" TEXT,
    "responder" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Answer_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NannoJikanDayoClick" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "question_id" INTEGER NOT NULL,
    "ip_address" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NannoJikanDayoClick_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Like" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "question_id" INTEGER NOT NULL,
    "ip_address" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Like_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "question_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "commenter_name" TEXT NOT NULL DEFAULT '匿名',
    "ip_address" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Comment_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Question_notification_token_key" ON "Question"("notification_token");

-- CreateIndex
CREATE INDEX "Question_status_idx" ON "Question"("status");

-- CreateIndex
CREATE INDEX "Question_category_idx" ON "Question"("category");

-- CreateIndex
CREATE INDEX "Question_created_at_idx" ON "Question"("created_at");

-- CreateIndex
CREATE INDEX "Answer_question_id_idx" ON "Answer"("question_id");

-- CreateIndex
CREATE INDEX "Answer_created_at_idx" ON "Answer"("created_at");

-- CreateIndex
CREATE INDEX "NannoJikanDayoClick_question_id_idx" ON "NannoJikanDayoClick"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "NannoJikanDayoClick_question_id_ip_address_key" ON "NannoJikanDayoClick"("question_id", "ip_address");

-- CreateIndex
CREATE UNIQUE INDEX "Like_question_id_ip_address_key" ON "Like"("question_id", "ip_address");

-- CreateIndex
CREATE INDEX "Comment_question_id_idx" ON "Comment"("question_id");

-- CreateIndex
CREATE INDEX "Comment_created_at_idx" ON "Comment"("created_at");
