import CreateUserScreen from "./CreateUserScreen";
import { Resource } from "@/types/Enums/Resource";
import { deleteRecord } from "@/Utils/services/deleteRecord";
import { applyRecordChange } from "@/Utils/recordChanges";
import { getSession } from "@/Storage/session";
import styled from "styled-components";
import { useMessages } from "@/Dictionary/messages";
import { useAppSelector } from "@/Redux/store";
import { ROUTES } from "@/Routes/routes";
import { normalizeDigits, normalizeSearch } from "@/Utils/format";
import { getUser, getUsers } from "@/Utils/services/userApi";
import type { User } from "@/types/user";
import RecordList from "./RecordList";

const Name = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  span {
    background: var(--tint);
    color: var(--brand-ink);
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    flex: none;
    font:
      700 11px Inter,
      sans-serif;
  }
`;
const contact = (text: string) => (
  <bdi dir="ltr" className="latin">
    {text}
  </bdi>
);

export default function UsersScreen() {
  const { m } = useMessages();
  const changes = useAppSelector((state) => state.records.users);
  return (
    <RecordList<User>
      title={m.users}
      description={m.usersHelp}

      add={m.addUser}
      createPath={ROUTES.createUser}
      search={m.searchUsers}
      empty={m.noUsers}
      error={m.usersLoadError}
      icon="users"

      changes={changes}
      resource="users"
      onDelete={async (row) => {
        const session = getSession();
        if (!session) throw new Error("Session expired");
        if (row.key.startsWith("api:")) await deleteRecord(Resource.Users, row.item.id);
        if (getSession() !== session) throw new Error("Session changed");
        return applyRecordChange("users", { key: row.key, item: null });
      }}
      editForm={(row, close) => <CreateUserScreen edit={row} onComplete={close} />}
      request={getUsers}
      recordName={(item) => item.firstName + " " + item.lastName}
      requestDetail={getUser}
      matches={(user, term) =>
        (/^\+?[\d ()-]+$/.test(term) &&
          normalizeDigits(user.phone).replace(/\D/g, "").includes(term.replace(/\D/g, ""))) ||
        normalizeSearch(
          [user.firstName + " " + user.lastName, user.username, user.email].join(" ")
        ).includes(term)
      }
      columns={[
        {
          label: m.fullName,

          render: (item) => (
            <Name>
              <span aria-hidden="true">
                {(item.firstName.slice(0, 1) + item.lastName.slice(0, 1)).toUpperCase()}
              </span>
              <strong>
                <bdi>
                  {item.firstName} {item.lastName}
                </bdi>
              </strong>
            </Name>
          ),
        },
        { label: m.username, render: (item) => contact(item.username) },
        { label: m.email, render: (item) => contact(item.email) },
        { label: m.phone, render: (item) => contact(item.phone) },
      ]}
    />
  );
}
