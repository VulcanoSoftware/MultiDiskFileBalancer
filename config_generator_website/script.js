document.addEventListener('DOMContentLoaded', () => {
  // State for dynamic lists
  const srcFolders = ['/media/storage/input'];
  const disks = [
    { name: 'disk1', path: '/media/storage/out1' },
    { name: 'disk2', path: '/media/storage/out2' },
  ];

  // DOM Elements
  const srcFoldersContainer = document.getElementById('srcFoldersContainer');
  const disksContainer = document.getElementById('disksContainer');
  const addSrcFolderBtn = document.getElementById('addSrcFolderBtn');
  const addDiskBtn = document.getElementById('addDiskBtn');
  const yamlOutput = document.getElementById('yamlOutput');
  const copyConfigBtn = document.getElementById('copyConfigBtn');
  const downloadConfigBtn = document.getElementById('downloadConfigBtn');
  const copyStatus = document.getElementById('copyStatus');

  // Input elements
  const inputBackupStrategy = document.getElementById('cfg_backup_strategy');
  const inputRaidSimulation = document.getElementById('cfg_raid_simulation');
  const inputMinFileAge = document.getElementById('cfg_min_file_age_hours');
  const inputScanInterval = document.getElementById('cfg_scan_interval_seconds');
  const inputWebpanelEnabled = document.getElementById('cfg_webpanel_enabled');
  const inputWebpanelPort = document.getElementById('cfg_webpanel_port');
  const inputWebpanelUser = document.getElementById('cfg_webpanel_username');
  const inputWebpanelPass = document.getElementById('cfg_webpanel_password');
  const inputWebdavEnabled = document.getElementById('cfg_webdav_enabled');
  const inputWebdavPort = document.getElementById('cfg_webdav_port');
  const inputSftpEnabled = document.getElementById('cfg_sftp_enabled');
  const inputSftpPort = document.getElementById('cfg_sftp_port');
  const inputFuseEnabled = document.getElementById('cfg_fuse_enabled');
  const inputFuseMountPoint = document.getElementById('cfg_fuse_mount_point');
  const inputSpaceCheckMinFree = document.getElementById('cfg_space_check_default_min_free_gb');
  const inputAutoCleanupOnMove = document.getElementById('cfg_auto_cleanup_on_move');

  function renderSrcFolders() {
    srcFoldersContainer.innerHTML = '';
    srcFolders.forEach((folder, index) => {
      const row = document.createElement('div');
      row.className = 'list-row';
      row.innerHTML = `
        <input type="text" value="${folder}" placeholder="/path/to/folder" class="src-input" data-index="${index}">
        <button type="button" class="btn-icon delete" data-index="${index}"><i class="fas fa-trash"></i></button>
      `;
      srcFoldersContainer.appendChild(row);
    });

    srcFoldersContainer.querySelectorAll('.src-input').forEach((input) => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        srcFolders[idx] = e.target.value.trim();
        updateYaml();
      });
    });

    srcFoldersContainer.querySelectorAll('.delete').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index, 10);
        if (srcFolders.length > 1) {
          srcFolders.splice(idx, 1);
          renderSrcFolders();
          updateYaml();
        }
      });
    });
  }

  function renderDisks() {
    disksContainer.innerHTML = '';
    disks.forEach((disk, index) => {
      const row = document.createElement('div');
      row.className = 'list-row disk-row';
      row.innerHTML = `
        <input type="text" value="${disk.name}" placeholder="disk${index + 1}" class="disk-name" data-index="${index}">
        <input type="text" value="${disk.path}" placeholder="/media/storage/out${index + 1}" class="disk-path" data-index="${index}">
        <button type="button" class="btn-icon delete-disk" data-index="${index}"><i class="fas fa-trash"></i></button>
      `;
      disksContainer.appendChild(row);
    });

    disksContainer.querySelectorAll('.disk-name').forEach((input) => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        disks[idx].name = e.target.value.trim();
        updateYaml();
      });
    });

    disksContainer.querySelectorAll('.disk-path').forEach((input) => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        disks[idx].path = e.target.value.trim();
        updateYaml();
      });
    });

    disksContainer.querySelectorAll('.delete-disk').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index, 10);
        if (disks.length > 1) {
          disks.splice(idx, 1);
          renderDisks();
          updateYaml();
        }
      });
    });
  }

  function generateYaml() {
    const validSrcFolders = srcFolders.filter((f) => f.trim() !== '');
    const validDisks = disks.filter((d) => d.name.trim() !== '' && d.path.trim() !== '');
    const primarySrc = validSrcFolders[0] || '/media/storage/input';
    const lastDisk = validDisks[0] ? validDisks[0].name : 'disk1';

    const backupStrategy = inputBackupStrategy.value;
    const raidSimulation = inputRaidSimulation.value;
    const minFileAgeHours = parseInt(inputMinFileAge.value, 10) || 4;
    const scanIntervalSeconds = parseInt(inputScanInterval.value, 10) || 120;

    const webpanelEnabled = inputWebpanelEnabled.value === 'true';
    const webpanelPort = parseInt(inputWebpanelPort.value, 10) || 5000;
    const webpanelUser = inputWebpanelUser.value.trim() || 'admin';
    const webpanelPass = inputWebpanelPass.value.trim() || 'changeme';

    const webdavEnabled = inputWebdavEnabled.value === 'true';
    const webdavPort = parseInt(inputWebdavPort.value, 10) || 8080;

    const sftpEnabled = inputSftpEnabled.value === 'true';
    const sftpPort = parseInt(inputSftpPort.value, 10) || 8081;

    const fuseEnabled = inputFuseEnabled.value === 'true';
    const fuseMountPoint = inputFuseMountPoint.value.trim() || '/home/user/Desktop/mount';

    const spaceCheckMinFreeGB = parseInt(inputSpaceCheckMinFree.value, 10) || 40;
    const autoCleanupOnMove = inputAutoCleanupOnMove.value === 'true';

    let yaml = `# VulcanoCraft MultiDisk FileBalancer config\n`;
    yaml += `# generated via MDFB Config Generator\n\n`;

    yaml += `src: ${primarySrc}\n\n`;
    yaml += `src_folders:\n`;
    validSrcFolders.forEach((folder) => {
      yaml += `  - ${folder}\n`;
    });

    yaml += `\nwebhook_url: ''\n\n`;

    yaml += `disks:\n`;
    validDisks.forEach((disk) => {
      yaml += `  - name: ${disk.name}\n    path: ${disk.path}\n`;
    });

    yaml += `\nlast_disk: ${lastDisk}\n\n`;

    yaml += `settings:\n`;
    yaml += `  min_file_age_hours: ${minFileAgeHours}\n`;
    yaml += `  extra_safety_space_gb: 5\n`;
    yaml += `  scan_interval_seconds: ${scanIntervalSeconds}\n`;
    yaml += `  console_clear_interval_hours: 6\n`;
    yaml += `  space_check_default_min_free_gb: ${spaceCheckMinFreeGB}\n`;
    yaml += `  backup_strategy: ${backupStrategy}\n`;
    yaml += `  raid_simulation: ${raidSimulation}\n`;
    yaml += `  space_hunter_min_file_age_hours: ${minFileAgeHours}\n`;
    yaml += `  space_hunter_exclude_folders: []\n`;
    yaml += `  space_hunter_dry_run: false\n`;
    yaml += `  space_hunter_max_actions_per_cycle: 0\n`;
    yaml += `  space_hunter_global_fallback: false\n`;
    yaml += `  auto_cleanup_on_move: ${autoCleanupOnMove ? 'true' : 'false'}\n\n`;

    yaml += `space_hunter_disks:\n`;
    validDisks.forEach((disk) => {
      yaml += `  - action: delete\n    min_free_gb: ${spaceCheckMinFreeGB}\n    path: ${disk.path}\n    move_destination: null\n`;
    });

    yaml += `\nreverse_raid:\n`;
    yaml += `  enabled: false\n`;
    yaml += `  source_paths:\n`;
    validDisks.forEach((disk) => {
      yaml += `    - ${disk.path}\n`;
    });
    yaml += `  destination_path: ${primarySrc}\n`;
    yaml += `  min_file_age_hours: 12\n`;
    yaml += `  run_interval_minutes: 10\n\n`;

    yaml += `webdav_server:\n`;
    yaml += `  enabled: ${webdavEnabled ? 'true' : 'false'}\n`;
    yaml += `  host: 0.0.0.0\n`;
    yaml += `  port: ${webdavPort}\n`;
    yaml += `  username: 'admin'\n`;
    yaml += `  password: 'changeme'\n`;
    yaml += `  upload_src: ${primarySrc}\n`;
    yaml += `  use_fuse_mount_as_root: true\n\n`;

    yaml += `sftp_server:\n`;
    yaml += `  enabled: ${sftpEnabled ? 'true' : 'false'}\n`;
    yaml += `  host: 0.0.0.0\n`;
    yaml += `  port: ${sftpPort}\n`;
    yaml += `  username: 'raiduser'\n`;
    yaml += `  password: 'changeme'\n`;
    yaml += `  upload_src: ${primarySrc}\n`;
    yaml += `  use_fuse_mount_as_root: true\n\n`;

    yaml += `nfs_server:\n`;
    yaml += `  enabled: false\n`;
    yaml += `  host: 0.0.0.0\n`;
    yaml += `  port: 2049\n`;
    yaml += `  permitted: '*'\n`;
    yaml += `  upload_src: ${primarySrc}\n`;
    yaml += `  use_fuse_mount_as_root: true\n\n`;

    yaml += `fuse_server:\n`;
    yaml += `  enabled: ${fuseEnabled ? 'true' : 'false'}\n`;
    yaml += `  mount_point: ${fuseMountPoint}\n`;
    yaml += `  upload_src: ${primarySrc}\n\n`;

    yaml += `filebrowser:\n`;
    yaml += `  enabled: false\n`;
    yaml += `  port: 8082\n`;
    yaml += `  state_dir: /var/lib/multidisk-filebalancer/filebrowser\n`;
    yaml += `  username: admin\n`;
    yaml += `  password: changeme123456\n`;
    yaml += `  credentials_initialized: false\n\n`;

    yaml += `webpanel:\n`;
    yaml += `  enabled: ${webpanelEnabled ? 'true' : 'false'}\n`;
    yaml += `  host: 0.0.0.0\n`;
    yaml += `  port: ${webpanelPort}\n`;
    yaml += `  username: '${webpanelUser}'\n`;
    yaml += `  password: '${webpanelPass}'\n`;

    return yaml;
  }

  function updateYaml() {
    yamlOutput.textContent = generateYaml();
  }

  addSrcFolderBtn.addEventListener('click', () => {
    srcFolders.push(`/media/storage/input${srcFolders.length + 1}`);
    renderSrcFolders();
    updateYaml();
  });

  addDiskBtn.addEventListener('click', () => {
    const num = disks.length + 1;
    disks.push({ name: `disk${num}`, path: `/media/storage/out${num}` });
    renderDisks();
    updateYaml();
  });

  const allInputs = [
    inputBackupStrategy,
    inputRaidSimulation,
    inputMinFileAge,
    inputScanInterval,
    inputWebpanelEnabled,
    inputWebpanelPort,
    inputWebpanelUser,
    inputWebpanelPass,
    inputWebdavEnabled,
    inputWebdavPort,
    inputSftpEnabled,
    inputSftpPort,
    inputFuseEnabled,
    inputFuseMountPoint,
    inputSpaceCheckMinFree,
    inputAutoCleanupOnMove,
  ];

  allInputs.forEach((el) => {
    if (el) {
      el.addEventListener('input', updateYaml);
      el.addEventListener('change', updateYaml);
    }
  });

  copyConfigBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(yamlOutput.textContent);
      copyStatus.textContent = 'Copied config.yml to clipboard!';
      copyStatus.classList.add('active');
      setTimeout(() => {
        copyStatus.classList.remove('active');
      }, 3000);
    } catch (err) {
      copyStatus.textContent = 'Could not copy automatically. Select text above to copy.';
      copyStatus.classList.add('active');
    }
  });

  downloadConfigBtn.addEventListener('click', () => {
    const blob = new Blob([yamlOutput.textContent], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.yml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  renderSrcFolders();
  renderDisks();
  updateYaml();
});
