import { Spinner } from '@material-tailwind/react'
import { useState } from 'react'

import AcornIcon from '@components/Assets/acorn.svg'
import AddPictureIcon from '@components/Assets/add_picture.svg'
import HyperlinkIcon from '@components/Assets/hyperlink.svg'
import NoteIcon from '@components/Assets/note.svg'
import PictureIcon from '@components/Assets/picture.svg'
import Divider from '@components/Shared/Divider'
import useUploadImage from '@hooks/useUploadImage'
import cn from '@libs/class'
import { buildBlobImage } from '@libs/url'
import { EVote } from '@utils/feed/evidence'
import { VOTES } from '@utils/feed/hypothesis'
import { valueOf } from 'shared/utils/tokens'

const EVIDENCE_TYPES = {
    Hyperlink: {
        defaultValue: { url: '', anchorText: '' },
        description: 'Hyperlinks are great for sharing external sources or references',
        Icon: HyperlinkIcon,
    },
    Note: {
        defaultValue: { content: '', extended: false },
        description: 'Notes are great for sharing your thoughts or ideas in detail',
        Icon: NoteIcon,
    },
    Picture: {
        defaultValue: { blob: [] },
        description: 'Pictures are great for visualizing and strengthening your evidence',
        Icon: PictureIcon,
    },
}

const PostEvidenceForm = ({ configs, form, side, setForm, setSide, onForward }) => {
    const [loading, setLoading] = useState(false)

    const selectedFormat = form.Hyperlink || form.Picture || form.Note
    const validNoteLength =
        !form.Note ||
        form.Note.content.length <=
            (form.Note.extended
                ? configs?.['EVIDENCE_EXTENDED_NOTE_LIMIT'][1]
                : configs?.['EVIDENCE_NOTE_LIMIT'][1])
    const noEmptyFields =
        (!form.Hyperlink || (form.Hyperlink.url && form.Hyperlink.anchorText)) &&
        (!form.Picture || form.Picture.blob.length) &&
        (!form.Note || form.Note.content)

    const uploadImage = useUploadImage(
        (imageData) => setForm((prev) => ({ ...prev, Picture: { blob: imageData } })),
        setLoading
    )

    return (
        <div className="gap-normal flex w-full flex-col place-items-center items-center text-cold-800">
            <div className="gap-normal flex w-full flex-col justify-center">
                <p className="text-medium text-center font-light">
                    Which side would your evidence support?
                </p>
                <div className="gap-normal mx-auto grid w-full grid-cols-2 md:w-1/2">
                    {[EVote.Positive, EVote.Negative].map((c) => {
                        const { Icon, name, textColor, borderColor, bgColor } = VOTES[c]
                        return (
                            <button
                                key={c}
                                className={cn(
                                    'py-normal gap-small !text-small flex w-full transform items-center justify-center rounded-lg border-2 bg-opacity-0 transition-all duration-300 ease-in-out hover:bg-opacity-20 aria-selected:pointer-events-none aria-selected:bg-opacity-100 aria-selected:text-white',
                                    bgColor,
                                    textColor,
                                    borderColor
                                )}
                                onClick={() => setSide(c)}
                                aria-selected={c === side}
                            >
                                <Icon className="h-5 stroke-[1.5px] md:h-6" />
                                <span>{name}</span>
                            </button>
                        )
                    })}
                </div>
            </div>
            <Divider
                className="!py-medium mx-auto w-4/5"
                direction="horizontal"
                bgColor="bg-cold-800"
                borderColor="border-cold-800"
            />
            <div className="gap-normal flex w-full flex-col justify-center">
                <p className="text-medium text-center font-light">Select your evidence format</p>
                <div className="gap-normal mx-auto grid w-full grid-cols-1 grid-rows-3 md:grid-cols-3 md:grid-rows-1">
                    {Object.entries(EVIDENCE_TYPES).map(
                        ([key, { defaultValue, description, Icon }]) => (
                            <button
                                key={key}
                                className="gap-small p-medium flex w-full transform flex-col items-center justify-center rounded-xl border-2 border-cold-800 bg-cold-800 bg-opacity-0 text-cold-800 transition-all duration-300 ease-in-out hover:bg-opacity-20 aria-checked:bg-opacity-100 aria-checked:text-white aria-checked:hover:bg-opacity-80"
                                onClick={() =>
                                    setForm((prev) => ({
                                        ...prev,
                                        [key]: prev[key] ? null : defaultValue,
                                    }))
                                }
                                aria-checked={!!form[key]}
                            >
                                <div className="text-medium flex w-full items-center justify-between">
                                    <div className="gap-small flex items-center">
                                        <Icon className="h-4 stroke-2 md:h-5 xl:h-6" />
                                        <span>{key}</span>
                                    </div>
                                    <div className="gap-small flex items-center">
                                        <span>
                                            -{' '}
                                            {valueOf(
                                                configs?.[`EVIDENCE_${key.toUpperCase()}_FEE`][1]
                                            )}
                                        </span>
                                        <AcornIcon className="h-4 stroke-[1.5px] md:h-5 xl:h-6" />
                                    </div>
                                </div>
                                <span className="text-tiny mb-auto text-left font-light">
                                    {description}
                                </span>
                            </button>
                        )
                    )}
                </div>
            </div>
            {selectedFormat && (
                <>
                    <Divider
                        className="!py-medium mx-auto w-4/5"
                        direction="horizontal"
                        bgColor="bg-cold-800"
                        borderColor="border-cold-800"
                    />
                    <div className="gap-normal flex w-full flex-col justify-center">
                        <p className="text-medium text-center font-light">Fill in the details</p>
                        <div className="gap-normal mx-auto grid w-full grid-cols-2">
                            <div
                                className="gap-small col-span-1 flex flex-col justify-between aria-expanded:col-span-2 aria-hidden:hidden"
                                aria-hidden={!form.Hyperlink}
                                aria-expanded={!form.Picture}
                            >
                                <div className="flex">
                                    <span className="px-small text-tiny flex items-center justify-center rounded-l-md border border-r-0 border-cold-400 bg-cold-100">
                                        https://
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="URL"
                                        value={form.Hyperlink?.url.replace('https://', '')}
                                        aria-selected={
                                            !!form.Hyperlink?.url.replace('https://', '')
                                        }
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                Hyperlink: {
                                                    ...prev.Hyperlink!,
                                                    url: `https://${e.target.value}`,
                                                },
                                            }))
                                        }
                                        className="input rounded-l-none rounded-r-md"
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Anchor Text"
                                    value={form.Hyperlink?.anchorText}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            Hyperlink: {
                                                ...prev.Hyperlink!,
                                                anchorText: e.target.value,
                                            },
                                        }))
                                    }
                                    aria-selected={!!form.Hyperlink?.anchorText}
                                    className="input"
                                />
                            </div>
                            <div
                                className="col-span-1 flex flex-col aria-expanded:col-span-2 aria-hidden:hidden"
                                aria-hidden={!form.Picture}
                                aria-expanded={!form.Hyperlink}
                            >
                                <label
                                    htmlFor="uploadFile1"
                                    className="input group relative h-[4rem] w-full cursor-pointer rounded border-2 border-dashed p-0 ring-0 hover:bg-cold-800/10 aria-disabled:pointer-events-none md:h-[5.5rem]"
                                    aria-selected={!!form.Picture?.blob.length}
                                    aria-disabled={loading}
                                >
                                    <input
                                        type="file"
                                        id="uploadFile1"
                                        className="hidden"
                                        accept="image/png, image/jpeg, image/webp"
                                        onChange={(e) => uploadImage(e)}
                                    />
                                    {form.Picture?.blob.length ? (
                                        <img
                                            src={buildBlobImage(form.Picture.blob)}
                                            alt="preview"
                                            className="h-full w-full object-cover group-hover:opacity-90"
                                        />
                                    ) : (
                                        <div className="px-normal gap-small flex h-full w-full items-center justify-center">
                                            <AddPictureIcon className="w-12 stroke-1 md:w-14" />
                                            <p className="text-extratiny md:text-tiny py-normal hidden md:block">
                                                Only PNG, JPEG, WEBP formats are accepted
                                            </p>
                                        </div>
                                    )}
                                    {loading && (
                                        <div className="absolute left-0 top-0 z-10 flex h-full w-full items-center justify-center rounded-lg bg-black/50">
                                            <Spinner
                                                color="white"
                                                className="h-8 w-8 md:h-10 md:w-10"
                                            />
                                        </div>
                                    )}
                                </label>
                            </div>
                            <div
                                className="gap-normal col-span-2 flex flex-col aria-expanded:col-span-2 aria-hidden:hidden"
                                aria-hidden={!form.Note}
                            >
                                <textarea
                                    placeholder="Enter Evidence Content"
                                    value={form.Note?.content}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            Note: {
                                                ...(prev.Note || EVIDENCE_TYPES.Note.defaultValue),
                                                content: e.target.value,
                                            },
                                        }))
                                    }
                                    aria-selected={!!form.Note?.content}
                                    className="input h-32"
                                />
                                <div className="text-small flex items-center justify-between">
                                    <div className="gap-normal flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={form.Note?.extended}
                                            onChange={(e) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    Note: {
                                                        ...prev.Note!,
                                                        extended: e.target.checked,
                                                    },
                                                }))
                                            }
                                            className="h-3.5 w-3.5 accent-cold-800 md:h-4 md:w-4"
                                        />
                                        <span>Extend Note</span>
                                        <div className="gap-extratiny flex items-center">
                                            <span>
                                                -{' '}
                                                {valueOf(configs['EVIDENCE_EXTENDED_NOTE_FEE'][1])}
                                            </span>
                                            <AcornIcon className="h-5 w-5 -translate-y-[0.5px] stroke-[1.5px]" />
                                        </div>
                                    </div>
                                    <p
                                        className={cn(
                                            'text-tiny',
                                            !validNoteLength && 'text-red-700'
                                        )}
                                    >
                                        {form.Note?.content.length} /{' '}
                                        {(form.Note?.extended
                                            ? configs['EVIDENCE_EXTENDED_NOTE_LIMIT'][1]
                                            : configs['EVIDENCE_NOTE_LIMIT'][1]
                                        ).toString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
            <Divider
                className="!py-medium mx-auto w-4/5"
                direction="horizontal"
                bgColor="bg-cold-800"
                borderColor="border-cold-800"
            />
            <button
                className="button w-auto min-w-36 bg-cold-700 hover:bg-cold-800 md:min-w-48"
                onClick={() => onForward()}
                disabled={!side || !selectedFormat || !validNoteLength || !noEmptyFields}
            >
                {!side
                    ? 'Select a side'
                    : !selectedFormat
                      ? 'Select a format'
                      : !noEmptyFields
                        ? 'Fill out all fields'
                        : !validNoteLength
                          ? 'Note content exceeds limit'
                          : 'Preview your Evidence'}
            </button>
        </div>
    )
}

export default PostEvidenceForm
