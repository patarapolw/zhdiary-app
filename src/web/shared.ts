import { ITreeViewItem } from "./quiz/TreeviewItem";

export const treeviewData: ITreeViewItem[] = [
    {
        name: "All vocabularies",
        query: "template:vocab/*",
        children: [
            {
                name: "HSK",
                query: "tag:HSK",
                children: [
                    {
                        name: "HSK1",
                        query: "tag:HSK1"
                    },
                    {
                        name: "HSK2",
                        query: "tag:HSK2"
                    },
                    {
                        name: "HSK3",
                        query: "tag:HSK3"
                    },
                    {
                        name: "HSK4",
                        query: "tag:HSK4"
                    },
                    {
                        name: "HSK5",
                        query: "tag:HSK5"
                    },
                    {
                        name: "HSK6",
                        query: "tag:HSK6"
                    }
                ]
            },
            // {
            //     name: "Categories",
            //     query: ""
            // }
        ]
    },
    {
        name: "All sentences",
        query: "template:sentence/*"
    }
];