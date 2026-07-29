import { existsSync } from 'node:fs';
import { join } from 'node:path';

const BOOK_SLUG = /^[a-z0-9][a-z0-9-]*$/;

export function parseBookArg(args) {
  const equalsArgs = args.filter((arg) => arg.startsWith('--book='));
  const indexes = args
    .map((arg, index) => (arg === '--book' ? index : -1))
    .filter((index) => index >= 0);

  if (equalsArgs.length + indexes.length > 1) {
    throw new Error('--book 只能指定一次');
  }

  const bookId = equalsArgs[0]?.slice('--book='.length)
    ?? (indexes.length ? args[indexes[0] + 1] : null);

  if (bookId !== null && !BOOK_SLUG.test(bookId)) {
    throw new Error('--book 必须是由小写字母、数字和连字符组成的 slug');
  }
  return bookId;
}

export function assertBookExists(root, bookId) {
  const bookPath = join(root, 'books', bookId, 'book.json');
  if (!existsSync(bookPath)) throw new Error(`作品不存在：${bookId}`);
}
