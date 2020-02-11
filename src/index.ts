import { ExtensionContext, workspace } from 'coc.nvim';
import { existsSync, mkdirSync } from 'fs';
import * as cmds from './cmds';
import { Ctx } from './ctx';
import { downloadServer } from './downloader';
import { activateStatusDisplay } from './status_display';

export async function activate(context: ExtensionContext): Promise<void> {
  const ctx = new Ctx(context);

  const serverRoot = context.storagePath;
  if (!existsSync(serverRoot)) {
    mkdirSync(serverRoot);
  }

  const bin = ctx.resolveBin();
  if (!bin) {
    let msg = 'Rust Analyzer is not found, download from GitHub release?';
    const ret = await workspace.showQuickpick(['Yes', 'Cancel'], msg);
    if (ret === 0) {
      try {
        await downloadServer(context);
      } catch (e) {
        msg = 'Download ra_lsp_server failed, you can get it from https://github.com/rust-analyzer/rust-analyzer';
        workspace.showMessage(msg, 'error');
        return;
      }
    } else {
      return;
    }
  }

  activateStatusDisplay(ctx);

  ctx.registerCommand('analyzerStatus', cmds.analyzerStatus);
  ctx.registerCommand('applySourceChange', cmds.applySourceChange);
  ctx.registerCommand('selectAndApplySourceChange', cmds.selectAndApplySourceChange);
  ctx.registerCommand('collectGarbage', cmds.collectGarbage);
  ctx.registerCommand('expandMacro', cmds.expandMacro);
  ctx.registerCommand('joinLines', cmds.joinLines);
  ctx.registerCommand('matchingBrace', cmds.matchingBrace);
  ctx.registerCommand('parentModule', cmds.parentModule);
  ctx.registerCommand('run', cmds.run);
  ctx.registerCommand('runSingle', cmds.runSingle);
  ctx.registerCommand('syntaxTree', cmds.syntaxTree);
  ctx.registerCommand('showReferences', cmds.showReferences);
  ctx.registerCommand('reload', cmds.reload);
  ctx.registerCommand('upgrade', cmds.upgrade);
  ctx.registerCommand('ssr', cmds.ssr);

  try {
    await ctx.restartServer();
  } catch (e) {
    workspace.showMessage(e.message, 'error');
  }

  await ctx.checkUpdate();
}
