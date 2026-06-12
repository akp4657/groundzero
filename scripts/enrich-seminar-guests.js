'use strict';

const fs = require('fs');
const upath = require('upath');

const PLACEHOLDER = 'assets/img/roster/placeholder.svg';

function normalizeKey(value) {
    return String(value)
        .toLowerCase()
        .replace(/\.[^.]+$/i, '')
        .replace(/[^a-z0-9]/g, '');
}

function seminarCaption(guest) {
    const parts = [guest.name];
    if (guest.date) {
        parts.push(guest.date);
    }
    return parts.join(' — ');
}

function listSeminarFiles(seminarsDir) {
    if (!fs.existsSync(seminarsDir)) {
        return [];
    }

    return fs
        .readdirSync(seminarsDir)
        .filter((file) => /\.(jpe?g|png|webp|gif)$/i.test(file));
}

function findFullNameImage(files, guestName) {
    const target = normalizeKey(guestName.replace(/\s+/g, '_'));

    return files.find((file) => normalizeKey(file) === target);
}

function findLastNameSlideFiles(files, guestName, fullNameFile) {
    const lastName = normalizeKey(guestName.trim().split(/\s+/).pop());
    const fullKey = fullNameFile ? normalizeKey(fullNameFile) : null;

    return files.filter((file) => {
        const key = normalizeKey(file);
        return key === lastName && key !== fullKey;
    });
}

module.exports = function enrichSeminarGuests(siteData, srcPath) {
    if (!siteData || !Array.isArray(siteData.seminarGuests)) {
        return siteData;
    }

    const seminarsDir = upath.resolve(srcPath, 'assets/Seminars');
    const files = listSeminarFiles(seminarsDir);

    siteData.seminarGuests = siteData.seminarGuests.map((guest) => {
        const fullNameFile = findFullNameImage(files, guest.name);
        const slideFiles = findLastNameSlideFiles(files, guest.name, fullNameFile);
        const next = { ...guest };

        if (fullNameFile) {
            next.image = `assets/Seminars/${fullNameFile}`;
        } else if (!next.image || next.image === PLACEHOLDER) {
            next.image = PLACEHOLDER;
        }

        if (slideFiles.length) {
            next.slides = slideFiles.map((file) => ({
                image: `assets/Seminars/${file}`,
                caption: seminarCaption(guest),
            }));
            next.hasGallery = true;
        } else {
            next.hasGallery = false;
            if (Array.isArray(next.slides)) {
                delete next.slides;
            }
        }

        return next;
    });

    return siteData;
};
