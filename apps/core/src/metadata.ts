/* eslint-disable @eslint-community/eslint-comments/no-unlimited-disable */
/* eslint-disable */
export default async () => {
  const t = {
    ['./shared/types/content-format.type']:
      await import('./shared/types/content-format.type'),
    ['./shared/model/image.model']: await import('./shared/model/image.model'),
    ['./modules/note/models/coordinate.model']:
      await import('./modules/note/models/coordinate.model'),
    ['./shared/model/count.model']: await import('./shared/model/count.model'),
    ['./modules/topic/topic.model']:
      await import('./modules/topic/topic.model'),
    ['./modules/category/category.model']:
      await import('./modules/category/category.model'),
    ['./modules/post/post.model']: await import('./modules/post/post.model'),
    ['./shared/interface/paginator.interface']:
      await import('./shared/interface/paginator.interface'),
    ['./constants/db.constant']: await import('./constants/db.constant'),
    ['./modules/snippet/snippet.schema']:
      await import('./modules/snippet/snippet.schema'),
    ['./modules/comment/comment.model']:
      await import('./modules/comment/comment.model'),
    ['./modules/draft/draft.model']:
      await import('./modules/draft/draft.model'),
    ['./modules/file/file-reference.model']:
      await import('./modules/file/file-reference.model'),
    ['./modules/activity/activity.constant']:
      await import('./modules/activity/activity.constant'),
    ['./modules/link/link.model']: await import('./modules/link/link.model'),
    ['./modules/meta-preset/meta-preset.model']:
      await import('./modules/meta-preset/meta-preset.model'),
    ['./constants/business-event.constant']:
      await import('./constants/business-event.constant'),
    ['./modules/owner/owner.model']:
      await import('./modules/owner/owner.model'),
    ['./modules/recently/recently.model']:
      await import('./modules/recently/recently.model'),
    ['./modules/configs/configs.interface']:
      await import('./modules/configs/configs.interface'),
  }
  return {
    '@nestjs/swagger': {
      models: [
        [
          import('./shared/model/count.model'),
          {
            CountModel: {
              read: { required: false, type: () => Number },
              like: { required: false, type: () => Number },
            },
          },
        ],
        [
          import('./shared/model/base.model'),
          {
            BaseModel: {
              created: { required: false, type: () => Date },
              id: { required: true, type: () => String },
            },
          },
        ],
        [
          import('./shared/model/base-comment.model'),
          {
            BaseCommentIndexModel: {
              commentsIndex: { required: false, type: () => Number },
              allowComment: { required: true, type: () => Boolean },
            },
          },
        ],
        [
          import('./shared/model/image.model'),
          {
            ImageModel: {
              width: { required: false, type: () => Number },
              height: { required: false, type: () => Number },
              accent: { required: false, type: () => String },
              type: { required: false, type: () => String },
              src: { required: false, type: () => String },
              blurHash: { required: false, type: () => String },
            },
          },
        ],
        [
          import('./shared/model/write-base.model'),
          {
            WriteBaseModel: {
              title: { required: true, type: () => String },
              text: { required: true, type: () => String },
              contentFormat: {
                required: true,
                enum: t['./shared/types/content-format.type'].ContentFormat,
              },
              content: { required: false, type: () => String },
              images: {
                required: false,
                type: () => [t['./shared/model/image.model'].ImageModel],
              },
              modified: { required: true, type: () => Date, nullable: true },
              created: { required: false, type: () => Date },
              meta: { required: false, type: () => Object },
            },
          },
        ],
        [
          import('./modules/topic/topic.model'),
          {
            TopicModel: {
              description: { required: false, type: () => String },
              introduce: { required: true, type: () => String },
              name: { required: true, type: () => String },
              slug: { required: true, type: () => String },
              icon: { required: false, type: () => String },
            },
          },
        ],
        [
          import('./modules/note/models/coordinate.model'),
          {
            Coordinate: {
              latitude: { required: true, type: () => Number },
              longitude: { required: true, type: () => Number },
            },
          },
        ],
        [
          import('./modules/note/note.model'),
          {
            NoteModel: {
              title: { required: true, type: () => String },
              nid: { required: true, type: () => Number },
              isPublished: { required: false, type: () => Boolean },
              password: { required: true, type: () => String, nullable: true },
              publicAt: { required: true, type: () => Date, nullable: true },
              mood: { required: false, type: () => String },
              weather: { required: false, type: () => String },
              bookmark: { required: true, type: () => Boolean },
              coordinates: {
                required: false,
                type: () =>
                  t['./modules/note/models/coordinate.model'].Coordinate,
              },
              location: { required: false, type: () => String },
              count: {
                required: true,
                type: () => t['./shared/model/count.model'].CountModel,
              },
              topicId: { required: false, type: () => Object },
              topic: {
                required: false,
                type: () => t['./modules/topic/topic.model'].TopicModel,
              },
            },
          },
        ],
        [
          import('./modules/page/page.model'),
          {
            PageModel: {
              slug: { required: true, type: () => String },
              subtitle: { required: false, type: () => String, nullable: true },
              order: { required: true, type: () => Number },
            },
          },
        ],
        [
          import('./modules/category/category.model'),
          {
            CategoryModel: {
              name: { required: true, type: () => String },
              type: {
                required: false,
                enum: t['./modules/category/category.model'].CategoryType,
              },
              slug: { required: true, type: () => String },
            },
          },
        ],
        [
          import('./modules/post/post.model'),
          {
            PostModel: {
              slug: { required: true, type: () => String },
              summary: { required: true, type: () => String, nullable: true },
              categoryId: { required: true, type: () => Object },
              category: { required: true, type: () => Object },
              copyright: { required: false, type: () => Boolean },
              isPublished: { required: false, type: () => Boolean },
              tags: { required: false, type: () => [String] },
              count: {
                required: true,
                type: () => t['./shared/model/count.model'].CountModel,
              },
              pin: { required: false, type: () => Date, nullable: true },
              pinOrder: { required: false, type: () => Number },
              relatedId: { required: false, type: () => [String] },
              related: { required: true, type: () => [Object] },
            },
            PostPaginatorModel: {
              data: {
                required: true,
                type: () => [t['./modules/post/post.model'].PostModel],
              },
              pagination: {
                required: true,
                type: () =>
                  t['./shared/interface/paginator.interface'].Paginator,
              },
            },
          },
        ],
        [
          import('./modules/recently/recently.model'),
          {
            RecentlyModel: {
              content: { required: true, type: () => String },
              ref: { required: true, type: () => Object },
              refType: {
                required: true,
                enum: t['./constants/db.constant'].CollectionRefTypes,
              },
              modified: { required: false, type: () => Date },
              up: { required: true, type: () => Number, description: '\u9876' },
              down: {
                required: true,
                type: () => Number,
                description: '\u8E29',
              },
            },
          },
        ],
        [
          import('./shared/dto/id.dto'),
          { MongoIdDto: {}, StringIdDto: {}, IntIdOrMongoIdDto: {} },
        ],
        [
          import('./modules/configs/configs.model'),
          {
            OptionModel: {
              name: { required: true, type: () => String },
              value: { required: true, type: () => Object },
            },
          },
        ],
        [
          import('./processors/gateway/web/dtos/message.schema'),
          { MessageEventDto: {} },
        ],
        [
          import('./modules/configs/configs.schema'),
          {
            SeoDto: {},
            UrlDto: {},
            MailOptionsDto: {},
            CommentOptionsDto: {},
            BackupOptionsDto: {},
            ImageStorageOptionsDto: {},
            BaiduSearchOptionsDto: {},
            BingSearchOptionsDto: {},
            AlgoliaSearchOptionsDto: {},
            AdminExtraDto: {},
            FriendLinkOptionsDto: {},
            BarkOptionsDto: {},
            FeatureListDto: {},
            ThirdPartyServiceIntegrationDto: {},
            AuthSecurityDto: {},
            AIDto: {},
            OAuthDto: {},
          },
        ],
        [
          import('./modules/analyze/analyze.model'),
          {
            AnalyzeModel: {
              ip: { required: false, type: () => String },
              ua: { required: true, type: () => UAParser.UAParser },
              country: { required: false, type: () => String },
              path: { required: false, type: () => String },
              referer: { required: false, type: () => String },
              timestamp: { required: true, type: () => Date },
            },
          },
        ],
        [import('./modules/ack/ack.schema'), { AckDto: {} }],
        [
          import('./modules/ai/ai-task/ai-task.dto'),
          {
            CreateSummaryTaskDto: {},
            CreateTranslationTaskDto: {},
            CreateTranslationBatchTaskDto: {},
            CreateTranslationAllTaskDto: {},
            GetTasksQueryDto: {},
            DeleteTasksQueryDto: {},
          },
        ],
        [import('./shared/dto/pager.dto'), { PagerDto: {}, OffsetDto: {} }],
        [
          import('./modules/ai/ai-summary/ai-summary.schema'),
          {
            GenerateAiSummaryDto: {},
            GetSummaryQueryDto: {},
            GetSummaryStreamQueryDto: {},
            UpdateSummaryDto: {},
            GetSummariesGroupedQueryDto: {},
          },
        ],
        [
          import('./modules/ai/ai-summary/ai-summary.model'),
          {
            AISummaryModel: {
              hash: { required: true, type: () => String },
              summary: { required: true, type: () => String },
              refId: { required: true, type: () => String },
              lang: { required: false, type: () => String },
            },
          },
        ],
        [
          import('./modules/ai/ai-translation/ai-translation.schema'),
          {
            GetTranslationQueryDto: {},
            GetTranslationStreamQueryDto: {},
            UpdateTranslationDto: {},
            GetTranslationsGroupedQueryDto: {},
          },
        ],
        [
          import('./modules/ai/ai-translation/ai-translation.model'),
          {
            AITranslationModel: {
              hash: { required: true, type: () => String },
              refId: { required: true, type: () => String },
              refType: { required: true, type: () => String },
              lang: { required: true, type: () => String },
              sourceLang: { required: true, type: () => String },
              title: { required: true, type: () => String },
              text: { required: true, type: () => String },
              summary: { required: false, type: () => String },
              tags: { required: false, type: () => [String] },
              sourceModified: {
                required: false,
                type: () => Date,
                description:
                  "Snapshot of source article's modified time when translation is generated.",
              },
              aiModel: {
                required: false,
                type: () => String,
                description:
                  'AI model metadata for audit/debug.\nNote: existing documents may not have these fields.',
              },
              aiProvider: { required: false, type: () => String },
              contentFormat: { required: false, type: () => String },
              content: { required: false, type: () => String },
            },
          },
        ],
        [
          import('./modules/ai/ai-writer/ai-writer.schema'),
          { GenerateAiDto: {} },
        ],
        [import('./modules/owner/owner.schema'), { OwnerPatchDto: {} }],
        [
          import('./modules/owner/owner-profile.model'),
          {
            OwnerProfileModel: {
              readerId: {
                required: true,
                type: () => require('mongoose').Types.ObjectId,
              },
              mail: { required: false, type: () => String },
              url: { required: false, type: () => String },
              introduce: { required: false, type: () => String },
              lastLoginIp: { required: false, type: () => String },
              lastLoginTime: { required: false, type: () => Date },
              socialIds: { required: false, type: () => Object },
            },
          },
        ],
        [
          import('./modules/owner/owner.model'),
          {
            OwnerModel: {
              id: { required: true, type: () => String },
              _id: { required: false, type: () => Object },
              username: { required: true, type: () => String },
              name: { required: true, type: () => String },
              introduce: { required: false, type: () => String },
              avatar: { required: false, type: () => String },
              password: { required: false, type: () => String },
              mail: { required: false, type: () => String },
              url: { required: false, type: () => String },
              lastLoginTime: { required: false, type: () => Date },
              lastLoginIp: { required: false, type: () => String },
              socialIds: { required: false, type: () => Object },
              role: { required: false, type: () => Object },
              email: { required: false, type: () => String, nullable: true },
              image: { required: false, type: () => String, nullable: true },
              handle: { required: false, type: () => String },
              displayUsername: { required: false, type: () => String },
              created: { required: false, type: () => Date },
            },
          },
        ],
        [
          import('./modules/reader/reader.model'),
          {
            ReaderModel: {
              email: { required: true, type: () => String },
              name: { required: true, type: () => String },
              handle: { required: true, type: () => String },
              image: { required: true, type: () => String },
              role: { required: true, type: () => Object },
            },
          },
        ],
        [import('./shared/schema/image.schema'), { ImageDto: {} }],
        [
          import('./shared/schema/write-base.schema'),
          { WriteBaseDto: {}, PartialWriteBaseDto: {} },
        ],
        [
          import('./modules/snippet/snippet.schema'),
          { SnippetDto: {}, PartialSnippetDto: {}, SnippetMoreDto: {} },
        ],
        [
          import('./modules/snippet/snippet.model'),
          {
            SnippetModel: {
              type: {
                required: true,
                enum: t['./modules/snippet/snippet.schema'].SnippetType,
              },
              private: { required: true, type: () => Boolean },
              raw: { required: true, type: () => String },
              name: { required: true, type: () => String },
              reference: { required: true, type: () => String },
              comment: { required: false, type: () => String },
              metatype: { required: false, type: () => String },
              schema: { required: false, type: () => String },
              method: { required: false, type: () => String },
              customPath: { required: false, type: () => String },
              secret: { required: false, type: () => String },
              enable: { required: false, type: () => Boolean },
              updated: { required: false, type: () => String },
              builtIn: { required: false, type: () => Boolean },
              compiledCode: { required: false, type: () => String },
            },
          },
        ],
        [
          import('./modules/serverless/serverless.schema'),
          { ServerlessReferenceDto: {}, ServerlessLogQueryDto: {} },
        ],
        [
          import('./modules/serverless/serverless-log.model'),
          {
            ServerlessLogModel: {
              created: { required: false, type: () => Date },
              id: { required: true, type: () => String },
              functionId: { required: true, type: () => String },
              reference: { required: true, type: () => String },
              name: { required: true, type: () => String },
              method: { required: true, type: () => String },
              ip: { required: true, type: () => String },
              status: { required: true, type: () => Object },
              executionTime: { required: true, type: () => Number },
              logs: {
                required: true,
                type: () => [
                  {
                    level: { required: true, type: () => String },
                    timestamp: { required: true, type: () => Number },
                    args: { required: true, type: () => [Object] },
                  },
                ],
              },
              error: {
                required: false,
                type: () => ({
                  name: { required: true, type: () => String },
                  message: { required: true, type: () => String },
                  stack: { required: false, type: () => String },
                }),
              },
            },
          },
        ],
        [
          import('./modules/comment/comment.model'),
          {
            CommentModel: {
              ref: { required: true, type: () => Object },
              refType: {
                required: true,
                enum: t['./constants/db.constant'].CollectionRefTypes,
              },
              author: { required: true, type: () => String },
              mail: { required: true, type: () => String },
              url: { required: false, type: () => String },
              text: { required: true, type: () => String },
              state: {
                required: false,
                enum: t['./modules/comment/comment.model'].CommentState,
              },
              parent: { required: false, type: () => Object },
              children: { required: false, type: () => [Object] },
              commentsIndex: { required: false, type: () => Number },
              key: { required: false, type: () => String },
              ip: { required: false, type: () => String },
              agent: { required: false, type: () => String },
              pin: { required: false, type: () => Boolean },
              post: { required: true, type: () => Object },
              note: { required: true, type: () => Object },
              page: { required: true, type: () => Object },
              recently: { required: true, type: () => Object },
              location: { required: false, type: () => String },
              isWhispers: { required: false, type: () => Boolean },
              source: { required: false, type: () => String },
              avatar: { required: false, type: () => String },
              meta: { required: false, type: () => String },
              readerId: { required: false, type: () => String },
              editedAt: { required: false, type: () => Date },
            },
          },
        ],
        [
          import('./modules/comment/comment.schema'),
          {
            CommentDto: {},
            EditCommentDto: {},
            RequiredGuestReaderCommentDto: {},
            TextOnlyDto: {},
            CommentRefTypesDto: {},
            CommentStatePatchDto: {},
            BatchCommentStateDto: {},
            BatchCommentDeleteDto: {},
          },
        ],
        [
          import('./modules/draft/draft.model'),
          {
            DraftHistoryModel: {
              version: { required: true, type: () => Number },
              title: { required: true, type: () => String },
              text: {
                required: false,
                type: () => String,
                description:
                  '\u5F53 isFullSnapshot \u4E3A true \u65F6\uFF0C\u5B58\u50A8\u5B8C\u6574\u6587\u672C\n\u5F53 isFullSnapshot \u4E3A false \u65F6\uFF0C\u5B58\u50A8\u76F8\u5BF9\u4E8E\u6700\u8FD1\u4E00\u4E2A\u5168\u91CF\u5FEB\u7167\u7684 diff patches',
              },
              contentFormat: {
                required: true,
                enum: t['./shared/types/content-format.type'].ContentFormat,
              },
              content: { required: false, type: () => String },
              typeSpecificData: { required: false, type: () => String },
              savedAt: { required: true, type: () => Date },
              isFullSnapshot: {
                required: true,
                type: () => Boolean,
                description:
                  '\u662F\u5426\u4E3A\u5168\u91CF\u5FEB\u7167\ntrue: text \u5B57\u6BB5\u5B58\u50A8\u5B8C\u6574\u5185\u5BB9\nfalse: text \u5B57\u6BB5\u5B58\u50A8 diff patches (JSON \u5E8F\u5217\u5316)',
              },
              refVersion: {
                required: false,
                type: () => Number,
                description:
                  '\u6307\u5411\u6700\u8FD1\u7684\u5168\u91CF\u5FEB\u7167\u7248\u672C\uFF08\u7528\u4E8E\u65E0 diff \u7684\u53BB\u91CD\uFF09',
              },
              baseVersion: {
                required: false,
                type: () => Number,
                description:
                  '\u5F53\u524D\u7248\u672C\u57FA\u4E8E\u54EA\u4E2A\u5168\u91CF\u5FEB\u7167\uFF08\u7528\u4E8E\u524D\u7AEF\u5C55\u793A\u5F15\u7528\u5173\u7CFB\uFF09',
              },
            },
            DraftModel: {
              refType: {
                required: true,
                enum: t['./modules/draft/draft.model'].DraftRefType,
              },
              refId: {
                required: false,
                type: () => require('mongoose').Types.ObjectId,
              },
              title: { required: true, type: () => String },
              text: { required: true, type: () => String },
              contentFormat: {
                required: true,
                enum: t['./shared/types/content-format.type'].ContentFormat,
              },
              content: { required: false, type: () => String },
              images: {
                required: false,
                type: () => [t['./shared/model/image.model'].ImageModel],
              },
              meta: { required: false, type: () => Object },
              typeSpecificData: { required: false, type: () => String },
              version: { required: true, type: () => Number },
              publishedVersion: {
                required: false,
                type: () => Number,
                description:
                  '\u8349\u7A3F\u6700\u540E\u88AB\u53D1\u5E03\u65F6\u7684\u7248\u672C\u53F7\n\u5F53 publishedVersion === version \u65F6\uFF0C\u8868\u793A\u8349\u7A3F\u5185\u5BB9\u4E0E\u5DF2\u53D1\u5E03\u5185\u5BB9\u4E00\u81F4',
              },
              updated: { required: false, type: () => Date },
              history: {
                required: true,
                type: () => [
                  t['./modules/draft/draft.model'].DraftHistoryModel,
                ],
              },
            },
          },
        ],
        [
          import('./modules/draft/draft.schema'),
          {
            CreateDraftDto: {},
            UpdateDraftDto: {},
            DraftPagerDto: {},
            DraftRefTypeDto: {},
            DraftRefTypeAndIdDto: {},
            RestoreVersionDto: {},
          },
        ],
        [
          import('./modules/file/file-reference.model'),
          {
            FileReferenceModel: {
              fileUrl: { required: true, type: () => String },
              fileName: { required: true, type: () => String },
              status: {
                required: true,
                enum: t['./modules/file/file-reference.model']
                  .FileReferenceStatus,
              },
              refId: { required: false, type: () => String },
              refType: {
                required: false,
                enum: t['./modules/file/file-reference.model']
                  .FileReferenceType,
              },
            },
          },
        ],
        [
          import('./modules/note/note.schema'),
          {
            NoteDto: {},
            PartialNoteDto: {},
            NoteQueryDto: {},
            NotePasswordQueryDto: {},
            ListQueryDto: {},
            NidType: {},
            SetNotePublishStatusDto: {},
            NoteTopicPagerDto: {},
          },
        ],
        [
          import('./modules/slug-tracker/slug-tracker.model'),
          {
            SlugTrackerModel: {
              slug: { required: true, type: () => String },
              type: { required: true, type: () => String },
              targetId: { required: true, type: () => String },
            },
          },
        ],
        [
          import('./modules/post/post.schema'),
          {
            PostDto: {},
            PartialPostDto: {},
            CategoryAndSlugDto: {},
            PostDetailQueryDto: {},
            PostPagerDto: {},
            SetPostPublishStatusDto: {},
          },
        ],
        [
          import('./modules/activity/activity.schema'),
          {
            ActivityTypeParamsDto: {},
            ActivityDeleteDto: {},
            ActivityQueryDto: {},
            ActivityRangeDto: {},
            ActivityTopReadingsDto: {},
            ActivityNotificationDto: {},
            LikeBodyDto: {},
            UpdatePresenceDto: {},
            GetPresenceQueryDto: {},
          },
        ],
        [
          import('./modules/activity/activity.model'),
          {
            ActivityModel: {
              type: {
                required: true,
                enum: t['./modules/activity/activity.constant'].Activity,
              },
              payload: { required: true, type: () => Object },
            },
          },
        ],
        [import('./modules/analyze/analyze.schema'), { AnalyzeDto: {} }],
        [
          import('./modules/category/category.schema'),
          {
            CategoryDto: {},
            PartialCategoryDto: {},
            SlugOrIdDto: {},
            MultiQueryTagAndCategoryDto: {},
            MultiCategoriesQueryDto: {},
          },
        ],
        [
          import('./modules/file/file.schema'),
          {
            FileQueryDto: {},
            FileUploadDto: {},
            RenameFileQueryDto: {},
            BatchOrphanDeleteDto: {},
            BatchS3UploadDto: {},
          },
        ],
        [
          import('./modules/link/link.model'),
          {
            LinkModel: {
              name: { required: true, type: () => String },
              url: { required: true, type: () => String },
              avatar: { required: false, type: () => String },
              description: { required: false, type: () => String },
              type: {
                required: false,
                enum: t['./modules/link/link.model'].LinkType,
              },
              state: {
                required: true,
                enum: t['./modules/link/link.model'].LinkState,
              },
              email: { required: false, type: () => String },
            },
          },
        ],
        [
          import('./modules/link/link.schema'),
          {
            LinkSchemaDto: {},
            LinkDto: {},
            PartialLinkDto: {},
            AuditReasonDto: {},
          },
        ],
        [
          import('./modules/page/page.schema'),
          { PageDto: {}, PartialPageDto: {}, PageReorderDto: {} },
        ],
        [
          import('./modules/recently/recently.schema'),
          { RecentlyDto: {}, RecentlyAttitudeDto: {} },
        ],
        [
          import('./modules/say/say.model'),
          {
            SayModel: {
              text: { required: true, type: () => String },
              source: { required: true, type: () => String },
              author: { required: true, type: () => String },
            },
          },
        ],
        [
          import('./modules/aggregate/aggregate.schema'),
          {
            TopQueryDto: {},
            TimelineQueryDto: {},
            AggregateQueryDto: {},
            ReadAndLikeCountTypeDto: {},
          },
        ],
        [
          import('./modules/markdown/markdown.schema'),
          {
            MetaDto: {},
            DatatypeDto: {},
            DataListDto: {},
            ExportMarkdownQueryDto: {},
            MarkdownPreviewDto: {},
          },
        ],
        [
          import('./modules/option/option.schema'),
          {
            ConfigKeyDto: {},
            EmailTemplateTypeDto: {},
            EmailTemplateBodyDto: {},
          },
        ],
        [import('./modules/init/init.schema'), { InitOwnerCreateDto: {} }],
        [
          import('./modules/meta-preset/meta-preset.model'),
          {
            MetaFieldOption: {
              value: { required: true, type: () => Object },
              label: { required: true, type: () => String },
              exclusive: { required: false, type: () => Boolean },
            },
            MetaPresetChild: {
              key: { required: true, type: () => String },
              label: { required: true, type: () => String },
              type: {
                required: true,
                enum: t['./modules/meta-preset/meta-preset.model']
                  .MetaFieldType,
              },
              description: { required: false, type: () => String },
              placeholder: { required: false, type: () => String },
              options: {
                required: false,
                type: () => [
                  t['./modules/meta-preset/meta-preset.model'].MetaFieldOption,
                ],
              },
            },
            MetaPresetModel: {
              key: { required: true, type: () => String },
              label: { required: true, type: () => String },
              type: {
                required: true,
                enum: t['./modules/meta-preset/meta-preset.model']
                  .MetaFieldType,
              },
              description: { required: false, type: () => String },
              placeholder: { required: false, type: () => String },
              scope: {
                required: true,
                enum: t['./modules/meta-preset/meta-preset.model']
                  .MetaPresetScope,
              },
              options: {
                required: false,
                type: () => [
                  t['./modules/meta-preset/meta-preset.model'].MetaFieldOption,
                ],
              },
              allowCustomOption: { required: false, type: () => Boolean },
              children: {
                required: false,
                type: () => [
                  t['./modules/meta-preset/meta-preset.model'].MetaPresetChild,
                ],
              },
              isBuiltin: { required: true, type: () => Boolean },
              order: { required: true, type: () => Number },
              enabled: { required: true, type: () => Boolean },
              updated: { required: false, type: () => Date },
            },
          },
        ],
        [
          import('./modules/meta-preset/meta-preset.schema'),
          {
            CreateMetaPresetDto: {},
            UpdateMetaPresetDto: {},
            QueryMetaPresetDto: {},
            UpdateOrderDto: {},
          },
        ],
        [import('./modules/update/update.schema'), { UpdateAdminDto: {} }],
        [
          import('./modules/project/project.model'),
          {
            ProjectModel: {
              name: { required: true, type: () => String },
              previewUrl: { required: false, type: () => String },
              docUrl: { required: false, type: () => String },
              projectUrl: { required: false, type: () => String },
              images: { required: false, type: () => [String] },
              description: { required: true, type: () => String },
              avatar: { required: false, type: () => String },
              text: { required: true, type: () => String },
            },
          },
        ],
        [import('./modules/search/search.schema'), { SearchDto: {} }],
        [
          import('./modules/subscribe/subscribe.schema'),
          { SubscribeDto: {}, CancelSubscribeDto: {}, BatchUnsubscribeDto: {} },
        ],
        [
          import('./modules/subscribe/subscribe.model'),
          {
            SubscribeModel: {
              email: { required: true, type: () => String },
              cancelToken: { required: true, type: () => String },
              subscribe: { required: true, type: () => Number },
              verified: { required: true, type: () => Boolean },
            },
          },
        ],
        [
          import('./modules/webhook/webhook.model'),
          {
            WebhookModel: {
              payloadUrl: { required: true, type: () => String },
              events: { required: true, type: () => [String] },
              enabled: { required: true, type: () => Boolean },
              id: { required: true, type: () => String },
              secret: { required: true, type: () => String },
              scope: {
                required: true,
                enum: t['./constants/business-event.constant'].EventScope,
              },
            },
          },
        ],
        [
          import('./modules/webhook/webhook.schema'),
          { WebhookDto: {}, WebhookDtoPartial: {} },
        ],
        [
          import('./modules/webhook/webhook-event.model'),
          {
            WebhookEventModel: {
              headers: { required: true, type: () => String },
              payload: { required: true, type: () => String },
              event: { required: true, type: () => String },
              response: { required: true, type: () => String },
              success: { required: true, type: () => Boolean },
              hookId: { required: true, type: () => Object },
              status: { required: true, type: () => Number },
            },
          },
        ],
        [
          import('./modules/serverless/serverless.model'),
          {
            ServerlessStorageModel: {
              namespace: { required: true, type: () => String },
              key: { required: true, type: () => String },
              value: { required: true, type: () => Object },
            },
          },
        ],
        [
          import('./modules/pageproxy/pageproxy.schema'),
          { PageProxyDebugDto: {} },
        ],
      ],
      controllers: [
        [
          import('./modules/auth/auth.controller'),
          {
            AuthController: {
              getOrVerifyToken: { type: Object },
              generateToken: {},
              deleteToken: { type: String },
              oauthAsOwner: { type: String },
              getSession: { type: Object },
              getProviders: { type: [String] },
            },
          },
        ],
        [
          import('./app.controller'),
          {
            AppController: {
              getUptime: {},
              appInfo: {},
              ping: { type: String },
              likeThis: {},
              getLikeNumber: { type: Object },
              cleanCatch: {},
              cleanAllRedisKey: {},
            },
          },
        ],
        [
          import('./modules/ack/ack.controller'),
          { AckController: { ack: {} } },
        ],
        [
          import('./modules/ai/ai-summary/ai-summary.controller'),
          {
            AiSummaryController: {
              createSummaryTask: {},
              getSummaryByRefId: {},
              getSummaries: {},
              getSummariesGrouped: {},
              updateSummary: { type: Object },
              deleteSummary: {},
              getArticleSummary: { type: Object },
              generateArticleSummary: {},
            },
          },
        ],
        [
          import('./modules/ai/ai-task/ai-task.controller'),
          {
            AiTaskController: {
              getTasksByGroupId: {},
              cancelTasksByGroupId: {},
              getTask: { type: Object },
              getTasks: {},
              retryTask: {},
              cancelTask: {},
              deleteTask: {},
              deleteTasks: {},
            },
          },
        ],
        [
          import('./modules/ai/ai-translation/ai-translation.controller'),
          {
            AiTranslationController: {
              createTranslationTask: {},
              createTranslationBatchTask: {},
              createTranslationAllTask: {},
              getTranslationsByRefId: {},
              getTranslationsGrouped: {},
              updateTranslation: { type: Object },
              deleteTranslation: {},
              getArticleTranslation: { type: Object },
              getAvailableLanguages: { type: [String] },
              streamArticleTranslation: {},
            },
          },
        ],
        [
          import('./modules/ai/ai-writer/ai-writer.controller'),
          { AiWriterController: { generate: {} } },
        ],
        [
          import('./modules/ai/ai.controller'),
          {
            AiController: {
              getAvailableModels: { type: [Object] },
              fetchModelsList: {},
              testProviderConnection: {},
              testCommentReview: {},
              getModelsForProvider: { type: Object },
            },
          },
        ],
        [
          import('./modules/owner/owner.controller'),
          {
            OwnerController: {
              getOwnerInfo: {
                type: t['./modules/owner/owner.model'].OwnerModel,
              },
              patchOwner: { type: t['./modules/owner/owner.model'].OwnerModel },
              allowLogin: {},
              checkLogged: {},
            },
          },
        ],
        [
          import('./modules/reader/reader.controller'),
          {
            ReaderAuthController: {
              find: {},
              transferOwner: { type: String },
              revokeOwner: { type: String },
            },
          },
        ],
        [
          import('./modules/serverless/serverless.controller'),
          {
            ServerlessController: {
              getCodeDefined: { type: String },
              getInvocationLogs: {},
              getCompiledCode: { type: Object },
              getInvocationLogDetail: { type: Object },
              runServerlessFunctionWildcard: {},
              runServerlessFunction: {},
              resetBuiltInFunction: {
                summary:
                  '\u91CD\u7F6E\u5185\u5EFA\u51FD\u6570\uFF0C\u8FC7\u671F\u7684\u5185\u5EFA\u51FD\u6570\u4F1A\u88AB\u5220\u9664',
              },
            },
          },
        ],
        [
          import('./modules/comment/comment.controller'),
          {
            CommentController: {
              getRecentlyComments: {},
              getComments: {
                type: t['./modules/comment/comment.model'].CommentModel,
              },
              getCommentsByRefId: {},
              comment: {
                type: t['./modules/comment/comment.model'].CommentModel,
              },
              replyByCid: {
                type: t['./modules/comment/comment.model'].CommentModel,
              },
              commentByOwner: {
                type: t['./modules/comment/comment.model'].CommentModel,
              },
              replyByOwner: {
                type: t['./modules/comment/comment.model'].CommentModel,
              },
              modifyCommentState: {},
              deleteComment: {},
              batchUpdateState: {},
              batchDelete: {},
              editComment: {},
            },
          },
        ],
        [
          import('./modules/draft/draft.controller'),
          {
            DraftController: {
              create: { type: t['./modules/draft/draft.model'].DraftModel },
              list: {},
              getNewDrafts: {
                type: [t['./modules/draft/draft.model'].DraftModel],
              },
              getByRef: { type: Object },
              getById: { type: t['./modules/draft/draft.model'].DraftModel },
              update: { type: t['./modules/draft/draft.model'].DraftModel },
              delete: {},
              getHistory: {},
              getHistoryVersion: {
                type: t['./modules/draft/draft.model'].DraftHistoryModel,
              },
              restore: { type: t['./modules/draft/draft.model'].DraftModel },
            },
          },
        ],
        [
          import('./modules/topic/topic.controller'),
          {
            Upper: {
              getTopicByTopic: { type: Object },
              create: { type: Object },
              update: { type: Object },
            },
          },
        ],
        [
          import('./modules/note/note.controller'),
          {
            NoteController: {
              getNotes: {},
              getOneNote: { type: Object },
              getNoteList: {},
              create: { type: Object },
              modify: { type: Object },
              patch: {},
              deleteNote: {},
              getLatestOne: { type: Object },
              getNoteByNid: { type: Object },
              getNotesByTopic: {},
              setPublishStatus: {},
            },
          },
        ],
        [
          import('./modules/post/post.controller'),
          {
            PostController: {
              getPaginate: {},
              getBySlug: {},
              getById: { type: Object },
              getLatest: {},
              getByCateAndSlug: {},
              create: { type: Object },
              update: { type: Object },
              patch: {},
              deletePost: {},
              setPublishStatus: {},
            },
          },
        ],
        [
          import('./modules/activity/activity.controller'),
          {
            ActivityController: {
              thumbsUpArticle: {},
              getLikeActivities: {},
              activities: { type: Object },
              updatePresence: {},
              getPresence: {},
              deletePresence: { type: Object },
              deleteAllPresence: { type: Object },
              getRoomsInfo: {},
              getOnlineCount: {},
              getTopReadings: {},
              getReadingRangeRank: {},
              getNotification: {},
              getLastYearPublication: {},
            },
          },
        ],
        [
          import('./modules/analyze/analyze.controller'),
          {
            AnalyzeController: {
              getAnalyze: {},
              getAnalyzeToday: {},
              getAnalyzeWeek: {},
              getFragment: {},
              getTodayLikedArticle: {},
              getTrafficSource: {},
              getDeviceDistribution: {},
              clearAnalyze: {},
            },
          },
        ],
        [
          import('./modules/category/category.controller'),
          {
            CategoryController: {
              getCategories: { type: Object },
              getCategoryById: { type: Object },
              create: { type: Object },
              modify: { type: Object },
              patch: {},
              deleteCategory: { type: Object },
            },
          },
        ],
        [
          import('./modules/file/file.controller'),
          {
            FileController: {
              batchDeleteOrphans: {},
              batchUploadToS3: {},
              getOrphanFiles: {},
              getOrphanFilesCount: {},
              cleanupOrphanFiles: {},
              getTypes: {},
              get: {},
              upload: {},
              delete: {},
              rename: {},
            },
          },
        ],
        [
          import('./modules/link/link.controller'),
          {
            LinkControllerCrud: { gets: {}, getAll: { type: [Object] } },
            LinkController: {
              canApplyLink: {},
              getLinkCount: {},
              approveLink: {},
              sendReasonByEmail: {},
              checkHealth: {},
              migrateExternalAvatars: {
                summary:
                  '\u6279\u91CF\u8FC1\u79FB\u5DF2\u901A\u8FC7\u53CB\u94FE\u7684\u5916\u90E8\u5934\u50CF\u4E3A\u5185\u90E8\u94FE\u63A5',
              },
            },
          },
        ],
        [
          import('./modules/page/page.controller'),
          {
            PageController: {
              getPagesSummary: {},
              getPageById: { type: Object },
              getPageBySlug: {},
              create: { type: Object },
              modify: { type: Object },
              patch: {},
              reorder: {},
              deletePage: {},
            },
          },
        ],
        [
          import('./modules/recently/recently.controller'),
          {
            RecentlyController: {
              getLatestOne: { type: Object },
              getAll: {
                type: [t['./modules/recently/recently.model'].RecentlyModel],
              },
              getList: { type: [Object] },
              getOne: {
                type: t['./modules/recently/recently.model'].RecentlyModel,
              },
              create: { type: Object },
              del: {},
              update: { type: Object },
              attitude: {
                summary: '\u8868\u6001\uFF1A\u70B9\u8D5E\uFF0C\u70B9\u8E29',
              },
            },
          },
        ],
        [
          import('./modules/say/say.controller'),
          { SayController: { getRandomOne: {} } },
        ],
        [
          import('./modules/snippet/snippet-route.controller'),
          { SnippetRouteController: { handleCustomPath: {} } },
        ],
        [
          import('./modules/snippet/snippet.controller'),
          {
            SnippetController: {
              getList: {},
              importSnippets: { type: String },
              create: { type: Object },
              getSnippetById: {},
              getGroup: {},
              getGroupByReference: { type: [Object] },
              aggregate: { type: [Object] },
              getSnippetByName: { type: Object },
              update: { type: Object },
              delete: {},
            },
          },
        ],
        [
          import('./modules/aggregate/aggregate.controller'),
          {
            AggregateController: {
              aggregate: {},
              top: {},
              getTimeline: {},
              getSiteMapContent: {},
              getRSSFeed: { type: Object },
              stat: {},
              getAllReadAndLikeCount: {},
              getSiteWords: {},
              getCategoryDistribution: { type: [Object] },
              getTagCloud: { type: [Object] },
              getPublicationTrend: {},
              getTopArticles: {},
              getCommentActivity: { type: [Object] },
              getTrafficSource: {},
            },
          },
        ],
        [
          import('./modules/backup/backup.controller'),
          {
            BackupController: {
              createNewBackup: { type: require('node:stream').Readable },
              get: {},
              download: { type: require('node:fs').ReadStream },
              uploadAndRestore: {},
              rollback: {},
              deleteBackups: {},
              delete: {},
              backupAndUploadToS3: {},
            },
          },
        ],
        [
          import('./modules/cron-task/cron-task.controller'),
          {
            CronTaskController: {
              getCronDefinitions: { type: [Object] },
              getTasks: {},
              getTask: {},
              runCronTask: {},
              cancelTask: {},
              retryTask: {},
              deleteTask: {},
              deleteTasks: {},
            },
          },
        ],
        [
          import('./modules/debug/debug.controller'),
          {
            DebugController: {
              test: { type: String },
              sendEvent: {},
              runFunction: { type: Object },
            },
          },
        ],
        [
          import('./modules/dependency/dependency.controller'),
          {
            DependencyController: {
              getDependencyGraph: {},
              installDepsPty: { type: String },
            },
          },
        ],
        [
          import('./modules/markdown/markdown.controller'),
          {
            MarkdownController: {
              importArticle: { type: Object },
              exportArticleToMarkdown: {
                type: require('node:stream').Readable,
              },
              getRenderedMarkdownHtmlStructure: {},
            },
          },
        ],
        [
          import('./modules/feed/feed.controller'),
          { FeedController: { rss: { type: String } } },
        ],
        [
          import('./modules/health/health.controller'),
          {
            HealthController: {
              check: { type: String },
              testEmail: { type: Object },
            },
          },
        ],
        [
          import('./modules/helper/helper.controller'),
          { HelperController: { builderById: {}, refreshImages: {} } },
        ],
        [
          import('./modules/option/controllers/base.option.controller'),
          {
            BaseOptionController: {
              getOption: { type: Object },
              getFormSchema: { type: Object },
              getOptionKey: {},
              patch: { type: Object },
            },
          },
        ],
        [
          import('./modules/option/controllers/email.option.controller'),
          {
            EmailOptionController: {
              getEmailTemplate: {},
              overrideEmailTemplate: {},
              deleteEmailTemplate: {},
            },
          },
        ],
        [
          import('./modules/init/init.controller'),
          {
            InitController: {
              isInit: {},
              getDefaultConfig: {
                type: t['./modules/configs/configs.interface'].IConfig,
              },
              patch: { type: Object },
              createOwner: { type: String },
              uploadAndRestore: {},
            },
          },
        ],
        [
          import('./modules/meta-preset/meta-preset.controller'),
          {
            MetaPresetController: {
              getAll: {
                summary:
                  '\u83B7\u53D6\u6240\u6709\u9884\u8BBE\u5B57\u6BB5\n\u652F\u6301\u6309 scope \u8FC7\u6EE4',
                type: [Object],
              },
              getById: {
                summary: '\u83B7\u53D6\u5355\u4E2A\u9884\u8BBE\u5B57\u6BB5',
                type: Object,
              },
              create: {
                summary:
                  '\u521B\u5EFA\u81EA\u5B9A\u4E49\u9884\u8BBE\u5B57\u6BB5',
                type: Object,
              },
              update: {
                summary: '\u66F4\u65B0\u9884\u8BBE\u5B57\u6BB5',
                type: Object,
              },
              delete: {
                summary: '\u5220\u9664\u9884\u8BBE\u5B57\u6BB5',
                type: Object,
              },
              updateOrder: {
                summary: '\u6279\u91CF\u66F4\u65B0\u6392\u5E8F',
                type: [Object],
              },
            },
          },
        ],
        [
          import('./modules/update/update.controller'),
          { UpdateController: { updateDashboard: { type: String } } },
        ],
        [
          import('./modules/pageproxy/pageproxy.controller'),
          {
            PageProxyController: {
              getLocalBundledAdmin: {},
              proxyLocalDev: {},
              proxyAssetRoute: {},
            },
          },
        ],
        [
          import('./modules/render/render.controller'),
          {
            RenderEjsController: {
              renderArticle: { type: String },
              markdownPreview: { type: String },
            },
          },
        ],
        [
          import('./modules/search/search.controller'),
          {
            SearchController: {
              search: { type: Object },
              pushAlgoliaAllManually: {},
              getAlgoliaIndexJsonFile: {},
            },
          },
        ],
        [
          import('./modules/server-time/server-time.controller'),
          { ServerTimeController: { serverTime: {} } },
        ],
        [
          import('./modules/sitemap/sitemap.controller'),
          { SitemapController: { getSitemap: { type: String } } },
        ],
        [
          import('./modules/subscribe/subscribe.controller'),
          {
            SubscribeController: {
              checkStatus: {},
              list: {},
              subscribe: {},
              unsubscribe: { type: Object },
              unsubscribeBatch: {},
            },
          },
        ],
        [
          import('./modules/webhook/webhook.controller'),
          {
            WebhookController: {
              create: {},
              getAll: { type: [Object] },
              update: {},
              delete: {},
              getEventsByHookId: {},
              getEventsEnum: { type: [Object] },
              redispatch: {},
              clear: { type: Object },
            },
          },
        ],
      ],
    },
  }
}
