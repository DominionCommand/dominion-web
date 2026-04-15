import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

export type WarRoomFocusStatus = 'todo' | 'active' | 'blocked' | 'done';

export type WarRoomFocusState = {
  slug: string;
  status: WarRoomFocusStatus;
  owner?: string;
  note?: string;
  updatedAt: string;
};

export type WarRoomBoardState = {
  updatedAt: string;
  focusItems: WarRoomFocusState[];
};

const defaultState: WarRoomBoardState = {
  updatedAt: new Date(0).toISOString(),
  focusItems: [],
};

function getWarRoomBoardFilePath() {
  const dataDir = path.join(process.cwd(), '..', '..', 'data');
  return {
    dataDir,
    filePath: path.join(dataDir, 'war-room-board.json'),
  };
}

export async function readWarRoomBoardState(): Promise<WarRoomBoardState> {
  const { filePath } = getWarRoomBoardFilePath();

  try {
    const raw = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as Partial<WarRoomBoardState>;

    return {
      updatedAt: parsed.updatedAt || defaultState.updatedAt,
      focusItems: Array.isArray(parsed.focusItems)
        ? parsed.focusItems.filter(
            (entry): entry is WarRoomFocusState => Boolean(entry && typeof entry.slug === 'string' && typeof entry.status === 'string'),
          )
        : [],
    };
  } catch {
    return defaultState;
  }
}

export async function saveWarRoomFocusState(input: {
  slug: string;
  status: WarRoomFocusStatus;
  owner?: string;
  note?: string;
}) {
  const { dataDir, filePath } = getWarRoomBoardFilePath();
  const current = await readWarRoomBoardState();
  const updatedAt = new Date().toISOString();

  const nextFocus: WarRoomFocusState = {
    slug: input.slug,
    status: input.status,
    owner: input.owner?.trim() || undefined,
    note: input.note?.trim() || undefined,
    updatedAt,
  };

  const nextState: WarRoomBoardState = {
    updatedAt,
    focusItems: [
      nextFocus,
      ...current.focusItems.filter((entry) => entry.slug !== input.slug),
    ].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  };

  await mkdir(dataDir, { recursive: true });
  await writeFile(filePath, JSON.stringify(nextState, null, 2), 'utf8');

  return nextState;
}
